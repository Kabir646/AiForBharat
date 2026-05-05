import os
import json
import time
import asyncio
from typing import Dict, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()  # ensure .env is loaded

# Some versions of the google-genai SDK expect genai.configure(...)
try:
    import google.generativeai as genai
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if key:
        try:
            genai.configure(api_key=key)
            print("Configured google.generativeai with GEMINI_API_KEY from .env")
        except AttributeError:
            # older/newer SDK may not have configure(); we'll still continue and rely on env var
            print("genai.configure not present; relying on GOOGLE_API_KEY env var")
except Exception as e:
    print("Could not import google.generativeai to configure automatically:", e)


# Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))


# Custom exception for expired file references
class FileExpiredError(Exception):
    """Raised when a Gemini file reference has expired (404/403)."""
    pass


# In-memory chat sessions: {dpr_id: chat_object}
_chat_sessions = {}


async def upload_file(file_path: str) -> str:
    """
    Upload a file to Gemini Files API and wait for it to be processed.
    Returns the file reference (name/uri) that can be used in generation requests.
    """
    print(f"⏳ Uploading file to Gemini: {file_path}")
    start_time = time.time()
    
    # Upload the file (blocking call offloaded to thread)
    uploaded_file = await asyncio.to_thread(genai.upload_file, file_path)
    
    # Poll until the file is processed
    print(f"⏳ Waiting for file to be processed: {uploaded_file.name}")
    while uploaded_file.state.name == "PROCESSING":
        await asyncio.sleep(2)
        uploaded_file = await asyncio.to_thread(genai.get_file, uploaded_file.name)
    
    if uploaded_file.state.name == "FAILED":
        raise ValueError(f"File processing failed: {uploaded_file.name}")
    
    elapsed = time.time() - start_time
    print(f"✓ File uploaded and processed in {elapsed:.2f}s: {uploaded_file.name}")
    
    # Return the file reference (name is stable across SDK versions)
    return uploaded_file.name


async def generate_json_from_file(file_ref: str, schema_path: str) -> Dict:
    """
    Generate structured JSON from an uploaded file using Gemini in English only.
    """
    print(f"⏳ Generating JSON from file: {file_ref}")
    start_time = time.time()
    
    # Read the schema
    with open(schema_path, 'r') as f:
        schema_content = f.read()
    
    # Create a strict system prompt (English only) - TENDER EVALUATION
    system_instruction = f"""You are an expert Tender/Bid Proposal Analyst. Read the attached PDF (tender document or bid proposal) and produce EXACTLY one valid JSON object containing analysis in English.

MANDATORY BEHAVIOR:
1) OUTPUT: Return exactly one JSON object. Do NOT add markdown or extra text.
2) ANALYZE & INFER: You must both extract explicit values from the PDF and also ANALYZE the information and INFER values where the document does not state them. In particular you MUST compute:
   - overallScore: a numeric score 0-100 (see scoring rubric below). Do NOT return null for overallScore.
   - recommendation: one of exactly ["Shortlist", "Select", "Reject", "Review"]. Do NOT return null.
   - financialAnalysis: populate bidAmount and pricingStructure fields.
   - riskAssessment: identify top risks, severity and evidence (these are analytical outputs).
3) REQUIRED NON-NULL FIELDS: The following fields MUST NOT be null (fill them or infer if missing): 
   `"tenderDetails.tenderName"`, `"tenderDetails.bidderName"`, `"executiveSummary"`, `"overallScore"`, `"recommendation"`, and the entire `"financialAnalysis"` object.

4) TRACEABILITY: If you infer or compute any field (overallScore, recommendation, any financial number, or risk severity), include an explanation in the findings field.

5) **VERBATIM QUOTE EXTRACTION (CRITICAL FOR ALL EVIDENCE FIELDS)**:
   When extracting quotes for ANY evidence field (riskAssessment, evaluationCriteria, inconsistencyDetection, etc.):
   
   **STRICT RULES**:
   - Extract ONLY the actual text content from the PDF body - NO section headers, NO bullet points, NO labels
   - Copy the text EXACTLY as it appears - character-for-character, word-for-word
   - Include COMPLETE sentences (don't truncate mid-sentence)
   - Preserve ALL punctuation, capitalization, spacing
   - Do NOT paraphrase, summarize, reword, or interpret
   - The quote MUST be findable using Ctrl+F search in the original PDF
   - If a passage is very long (>200 words), extract 1-2 complete sentences verbatim
   
   **EXAMPLES**:
    GOOD quote: "The bidder has completed 5 similar projects in the last 3 years."
    BAD quote: "Past Experience: The bidder has completed 5 similar projects..." (includes header)

5b) **PAGE NUMBER ACCURACY (CRITICAL FOR PDF HIGHLIGHTING)**:
   For EVERY evidence item's `pageLocation` field:
   
   **STRICT RULES**:
   - You MUST provide the EXACT page number where the quote appears in the PDF
   - Double-check that the page number is CORRECT - the quote MUST exist on that page
   - Format: "Page X" or "Page X, Section Y.Z" (where X is the actual page number)
   - NEVER guess or estimate page numbers
   - If you're unsure of the exact page, search the PDF to find where the quote actually appears
   - The system will use this page number to jump to and highlight the quote in the PDF viewer
   - INCORRECT page numbers will break the highlighting feature
   
   **EXAMPLES**:
    GOOD: "Page 15, Section 3.2" (if quote is actually on page 15)
    BAD: "Page 15, Section 3.2" (if quote is actually on page 18)
    BAD: "Section 3.2" (missing page number)


6) **STATE AND SECTOR EXTRACTION** (CRITICAL FOR VALIDATION):
   
   Extract the project state and sector from the PDF:
   
   **State Extraction (`tenderDetails.projectLocation.state`):**
   - Carefully read the PDF to find the project location/state
   - Match it EXACTLY against one of these 36 Indian States/UTs:
     Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat,
     Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh,
     Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan,
     Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal,
     Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu,
     Delhi, Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry
   - Return the EXACT matching state name from the list above
   - If state is not clearly mentioned or doesn't match any state, return "Not Specified"
   
   **Sector Extraction (`extractedSector`):**
   - Identify the project sector/category/type from the PDF content
   - Match it against these sectors (from all schemes):
     Roads, Railways, Airports, Ports & Waterways, Logistics Infra, Pipelines,
     Power Generation, Power Transmission, Power Distribution, Urban Transit, Rural Infra, Large Water,
     SEZs, Industrial Parks, Textile Parks, Electronics Hubs, Defense Corridors, Common Effluent,
     Data Centers, Telecom Towers, Fixed Networks, Smart Systems, SATCOM,
     Water Supply, Sewage, Solid Waste, Desalination, Storm Water,
     Cold Chain, Cold Storage, Silos, Processing Units, Terminal Markets, Testing Labs,
     Healthcare, Education, Sports, Tourism, Exhibition,
     Solar, Wind, Green Hydrogen, EV Infra, Storage (ESS), Bio-Energy,
     Metals, Mining, Chemicals, Cement, Manufacturing,
     IT Parks, Retail, Hospitality, Residential, Co-working
   - Return the CLOSEST matching sector name from the list above
   - If sector is not clearly mentioned, infer from project description and return best match
   
   **Validation Flags (`validationFlags`):**
   - Leave ALL validation flag fields as null/empty - the backend will populate these
   - Do NOT set stateMismatch, sectorMismatch, or details fields

7) RISK ANALYSIS (CRITICAL - STRUCTURED EVIDENCE ARRAY REQUIRED): For `riskAssessment`, list the top 3-6 risks. For EACH risk you MUST provide:
   - `riskCategory`: Clear name of the risk type
   - `severity`: Exactly one of: High / Medium / Low
   - `description`: Detailed explanation of the risk and its potential impact
   - `mitigationStrategy`: How the risk can be mitigated
   - `evidence`: REQUIRED array of evidence objects. Provide 1-3 evidence items per risk, where EACH evidence item has TWO fields:
     * `quote`: VERBATIM quote from the document - copy EXACT text word-for-word as it appears in the PDF, including all punctuation. Do NOT paraphrase or summarize. Must be searchable with Ctrl+F in the original PDF.
     * `pageLocation`: Specific page and section reference (e.g., "Page 23, Section 4.2" or "Table 5.1, Page 34")

7) **TENDER DETAILS EXTRACTION**:
   - `tenderName`: Name/title of the tender
   - `tenderReferenceNumber`: Reference/ID number
   - `issuingAuthority`: Organization issuing the tender
   - `bidderName`: Name of the bidder/vendor submitting
   - `projectLocation`: city, state, country
   - `tenderType`: Type (Open, Limited, RFP, RFQ, etc.)
   - `submissionDate`: When the bid was submitted
   - `bidValidityPeriod`: How long the bid is valid

8) **FINANCIAL ANALYSIS**:
   - `bidAmount.totalBidValue`: Total bid value
   - `bidAmount.currency`: Currency (INR, USD, etc.)
   - `bidAmount.basePrice`: Base price
   - `bidAmount.taxesAndDuties`: Taxes
   - `bidAmount.totalPriceWithTax`: Total with tax
   - `pricingStructure.itemizedCostBreakdown`: Array of cost items
   - `pricingStructure.paymentTerms`: Payment schedule
   - `financialHealth`: bidder's turnover, networth, solvency

9) **TECHNICAL EVALUATION**:
   - `technicalScore`: 0-100 score for technical capability
   - `complianceMatrix`: technical specs met, deviations
   - `methodologyAndApproach`: with score, findings, strengths, weaknesses, evidence array (EACH evidence item MUST have `quote` field with VERBATIM text from PDF - follow section 5 rules, and `pageLocation`)
   - `projectTimeline`: proposedDuration (MUST be concise like "24 months" or "2 years"), milestones, isTimelineRealistic


10) **BIDDER QUALIFICATIONS**:
    - `experienceScore`: 0-100
    - `pastRelevantProjects`: Array of similar projects completed
    - `teamComposition.keyPersonnel`: Key team members with role, name, experience, qualification

11) **INCONSISTENCY DETECTION** (CRITICAL):
    Thoroughly analyze the document for inconsistencies and populate the `inconsistencyDetection` object:
    - Verify financial figures are consistent across sections
    - Identify timeline conflicts
    - Find conflicting data between sections
    - For EACH issue: provide category, severity (Critical/High/Medium/Low), description, location, detected values, impact, AND evidence
    - **EVIDENCE REQUIRED**: For each inconsistency, provide 1-2 evidence items. Each evidence item MUST have:
      * `quote`: VERBATIM quote from the document
      * `pageLocation`: Specific page and section reference
    - Set `hasInconsistencies` to true if ANY issues found
    - Count total inconsistencies accurately

12) **EVALUATION CRITERIA SCORING** (CRITICAL - WITH EVIDENCE):
    
    Calculate scores in `evaluationCriteria.criteriaBreakdown` based on these 6 pan-India tender evaluation parameters:
    
    - **technicalFeasibilityAndDesign (20%)**: 
      * Does the proposed engineering solution or technology match the specific requirements of the tender?
      * Are specifications of machinery, construction materials, or software stacks compatible and up-to-date?
      * Will the project fail due to outdated or incompatible technology?
      * Score 0-100
    
    - **implementationSchedule (15%)**:
      * Is the total project duration realistic?
      * Are phase-wise deadlines achievable?
      * Analyze the Gantt chart or PERT/CPM network
      * Identify the critical path
      * Is there a risk of time overruns?
      * Score 0-100
    
    - **costEstimateAndBOQ (25%)**:
      * Analyze the Bill of Quantities (BOQ)
      * Are unit rates for major line items accurate?
      * Do they match current Market Rates or Schedule of Rates (SOR)?
      * Is there evidence of cost loading (inflated prices)?
      * Is the budget sufficient to complete the work?
      * Score 0-100
    
    - **riskMitigationAndEnvironment (15%)**:
      * Are risks identified (geological, legal, supply chain)?
      * Are mitigation strategies adequate?
      * Are environmental clearances obtained?
      * Does it ensure regulatory compliance (pollution, land use, etc.)?
      * Does it protect from future liabilities?
      * Score 0-100
    
    - **financialViability (15%)**:
      * Analyze the Financial Internal Rate of Return (FIRR)
      * Evaluate Net Present Value (NPV) and payback period
      * Are projected cash flows realistic?
      * Is the break-even analysis sound?
      * Is the project financially sustainable and does it offer good return on investment?
      * Score 0-100
    
    - **resourceAllocationAndSite (10%)**:
      * What is the land acquisition status?
      * Is there availability of water/power/logistics?
      * Is the manpower plan adequate?
      * Can the project start immediately without Right of Way (ROW) or utility hurdles?
      * Is the site suitable?
      * Score 0-100
    
    For EACH criterion you MUST provide:
    - `score`: 0-100
    - `weight`: decimal (0.20, 0.15, 0.25, 0.15, 0.15, 0.10 respectively)
    - `findings`: what was found
    - `detailedReasoning`: why this score was given (answer the questions above)
    - `evidence`: Array of 1-3 evidence objects with `quote` (VERBATIM - follow section 5 rules EXACTLY) and `pageLocation`
      * CRITICAL: The `quote` field MUST contain EXACT text from the PDF - character-for-character, word-for-word
      * Extract COMPLETE sentences only (no truncation)
      * Do NOT paraphrase, summarize, or add headers
      * The quote MUST be searchable with Ctrl+F in the original PDF
    - `met`: boolean - whether minimum requirements are met

    
    Calculate `overallComplianceScore` = weighted sum of all 6 criteria scores.

13) **SMART RECOMMENDATIONS** (CRITICAL):
    Generate actionable recommendations in `smartRecommendations`:
    - **Critical Actions**: Must-address items before selection
    - **Improvement Suggestions**: Areas where bidder could improve
    - **Negotiation Points**: Areas where the buyer can negotiate better terms
    - **Next Steps**: Prioritized actionable steps

14) JSON ONLY: Your entire response must be parseable JSON ONLY. No extra lines or text.


Scoring rubric (apply to compute overallScore 0-100):
- Weighted components: 
  * Technical Feasibility & Design: 20%
  * Implementation Schedule: 15%
  * Cost Estimate & BOQ: 25%
  * Risk Mitigation & Environment: 15%
  * Financial Viability (FIRR/NPV): 15%
  * Resource Allocation & Site: 10%
- Recommendation thresholds:
  - overallScore >= 80 → "Select"
  - 60 <= overallScore < 80 → "Shortlist"
  - 40 <= overallScore < 60 → "Review"
  - overallScore < 40 → "Reject"


Follow the rubric and trace any deviations. Return only the JSON object.

SCHEMA:
{schema_content}

"""

    
    # Create the user prompt with schema
    user_prompt = f"""Analyze the attached PDF (tender document or bid proposal) and return EXACTLY one JSON object following the schema below.


ADDITIONAL INSTRUCTIONS:
- overallScore: compute a number 0-100 based on the 6 evaluation criteria (technical feasibility, schedule, cost/BOQ, risk/environment, financial viability, resources/site).
- recommendation: one of ["Select", "Shortlist", "Review", "Reject"].
- tenderDetails: extract tender name, reference number, issuing authority, bidder name, location, tender type, submission date.
- financialAnalysis: extract bid amount, pricing structure, and bidder's financial health.
- technicalEvaluation: score technical capability, assess methodology, evaluate timeline.
- bidderQualifications: assess experience, past projects, and team composition.
- evaluationCriteria: score each of the 6 criteria (technicalFeasibilityAndDesign, implementationSchedule, costEstimateAndBOQ, riskMitigationAndEnvironment, financialViability, resourceAllocationAndSite) with findings, reasoning, and evidence with quote and pageLocation.
- riskAssessment: list top 3-6 risks; each risk must include evidence array with quote and pageLocation.
- Always include page references for key citations where possible.

Now analyze the attached file and return EXACTLY the one JSON object described above. No extra text."""
    
    # Create the model with strict instructions
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        system_instruction=system_instruction
    )
    
    def _generate():
        file_obj = genai.get_file(file_ref)
        return model.generate_content([file_obj, user_prompt])

    response = await asyncio.to_thread(_generate)
    
    elapsed = time.time() - start_time
    print(f"✓ JSON generated in {elapsed:.2f}s (response length: {len(response.text)} chars)")
    
    # Parse and validate the JSON
    try:
        # Clean up response text (remove markdown if present)
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
        
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        try:
            parsed_json = json.loads(response_text)
        except json.JSONDecodeError:
            print("⚠ Initial JSON parse failed, attempting robust extraction...")
            # Fallback: try to find JSON object boundaries
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx+1]
                parsed_json = json.loads(json_str)
                print("✓ Robust extraction succeeded")
            else:
                raise
        
        # Validate structure
        if not isinstance(parsed_json, dict):
            raise ValueError("Response is not a JSON object")
        
        # Validate required keys (new tender schema)
        required_keys = [
            "tenderDetails", "executiveSummary", "overallScore", "recommendation",
            "financialAnalysis", "technicalEvaluation", "bidderQualifications",
            "riskAssessment", "inconsistencyDetection", "evaluationCriteria", "smartRecommendations"
        ]
        
        missing_keys = [key for key in required_keys if key not in parsed_json]
        if missing_keys:
            raise ValueError(f"Missing required keys: {missing_keys}")
        
        print(f"✓ JSON validated successfully")
        return parsed_json
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON parsing failed: {e}")
        print(f"Raw response: {response.text[:500]}...")
        raise ValueError(f"Failed to parse JSON from Gemini response: {str(e)}")


async def create_chat_session(dpr_id: int, file_ref: str) -> None:
    """
    Create a new chat session for a DPR if it doesn't exist.
    """
    if dpr_id in _chat_sessions:
        return
    
    print(f"⏳ Creating chat session for DPR {dpr_id}")
    
    def _create_session():
        try:
            # Get the file object
            file_obj = genai.get_file(file_ref)
            
            # Check if file is still valid
            if file_obj.state.name == "FAILED":
                raise ValueError(f"File has expired or is no longer available: {file_ref}")
        except Exception as e:
            error_msg = str(e)
            if "403" in error_msg or "404" in error_msg or "permission" in error_msg.lower() or "not found" in error_msg.lower():
                # Raise specific error for expiration so app.py can handle re-upload
                raise FileExpiredError(f"File {file_ref} has expired or is inaccessible.")
            raise ValueError(f"Cannot access file {file_ref}: {error_msg}")
        
        # Create model with system instructions for chat
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction="""You are a helpful assistant analyzing a Tender/Bid Proposal document.
When answering questions, USE CREATIVE FORMATTING to make responses easy to read:

FORMATTING RULES (Use these liberally):
1. **Bullet Points**: Use - or • for key points, lists, and features
2. **Numbered Lists**: Use 1. 2. 3. for step-by-step or priority ordering
3. **Tables**: Use | for comparisons, metrics, or structured data (example: | Feature | Value |)
4. **Bold**: Use **text** to highlight important terms
5. **Inline Code**: Use `code` for technical terms or references
6. **Sections**: Separate different topics with blank lines

CONTENT REQUIREMENTS:
- Reference specific information from the document
- Cite pages or sections using format: (page: X) or (section: Y)
- Be concise but comprehensive
- If information is not in the document, say so clearly
- Do not make up or hallucinate page numbers or facts

RESPONSE STYLE:
- Prefer visual structure (tables, lists) over paragraphs
- Use formatting to make data scannable
- Group related information together
- Always explain what the numbers or data mean
- For comparisons: use tables with clear headers"""
        )
        
        # Start chat with the document
        chat = model.start_chat(history=[])
        
        return chat, file_obj

    # Offload session creation to thread
    chat, file_obj = await asyncio.to_thread(_create_session)
    
    # Store the chat session and file reference
    _chat_sessions[dpr_id] = {
        'chat': chat,
        'file': file_obj
    }
    
    print(f"✓ Chat session created for DPR {dpr_id}")


async def send_chat_message(dpr_id: int, message: str, file_ref: str) -> Dict:
    """
    Send a message in the chat session and get a response.
    """
    print(f"⏳ Processing chat message for DPR {dpr_id}")
    start_time = time.time()
    
    # Create session if it doesn't exist
    if dpr_id not in _chat_sessions:
        await create_chat_session(dpr_id, file_ref)
    
    session = _chat_sessions[dpr_id]
    chat = session['chat']
    file_obj = session['file']
    
    # Send message with file context (blocking call offloaded)
    response = await asyncio.to_thread(chat.send_message, [file_obj, message])
    
    elapsed = time.time() - start_time
    print(f"✓ Chat response generated in {elapsed:.2f}s (length: {len(response.text)} chars)")
    
    return {
        'reply': response.text,
        'sources': []  # Gemini will include sources in text if instructed properly
    }


# Fallback note for REST API implementation:
# TODO: If google-generativeai SDK is not available, implement REST API fallback:
# - File upload: POST https://generativelanguage.googleapis.com/v1beta/files
# - File status: GET https://generativelanguage.googleapis.com/v1beta/files/{name}
# - Generate: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
# - Use Authorization: Bearer {GEMINI_API_KEY} header
# - See: https://ai.google.dev/api/rest

def clear_chat_session(dpr_id: int) -> None:
    """Clear the in-memory chat session for a DPR."""
    if dpr_id in _chat_sessions:
        del _chat_sessions[dpr_id]
        print(f"✓ Cleared chat session for DPR {dpr_id}")


# ===== COMPARISON CHAT FUNCTIONS =====

# In-memory comparison chat sessions: {comparison_id: chat_object}
_comparison_chat_sessions = {}


async def create_comparison_chat_session(comparison_id: int, file_refs: list[str]) -> None:
    """
    Create a new comparison chat session with multiple files.
    """
    if comparison_id in _comparison_chat_sessions:
        return
    
    print(f"⏳ Creating comparison chat session for comparison {comparison_id} with {len(file_refs)} files")
    
    def _create_session():
        try:
            # Get all file objects
            file_objs = []
            for ref in file_refs:
                try:
                    file_obj = genai.get_file(ref)
                    # Check if file is still valid
                    if file_obj.state.name == "FAILED":
                        raise ValueError(f"File has expired or is no longer available: {ref}")
                    file_objs.append(file_obj)
                except Exception as e:
                    error_msg = str(e)
                    if "403" in error_msg or "404" in error_msg or "permission" in error_msg.lower() or "not found" in error_msg.lower():
                        # Raise specific error for expiration so app.py can handle re-upload
                        raise FileExpiredError(f"File {ref} has expired or is inaccessible.")
                    raise ValueError(f"Cannot access file {ref}: {error_msg}")
        except FileExpiredError:
            raise  # Re-raise to propagate to caller
        except Exception as e:
            raise ValueError(f"Failed to create comparison session: {str(e)}")
        
        # Create detailed system instruction for comparison
        system_instruction = """You are an expert Detailed Project Report (DPR) Analyzer and Comparison Assistant.

Your role is to help users analyze and compare multiple DPR documents simultaneously. When users ask questions, you should:

1. **Cross-Document Analysis**: Compare and contrast information across all provided DPRs
2. **Identify Patterns**: Highlight common themes, differences, strengths, and weaknesses across documents
3. **Financial Comparison**: Compare financial metrics like costs, revenues, IRR, DSCR, payback periods
4. **Risk Assessment Comparison**: Compare risk profiles and mitigation strategies
5. **Recommendations**: Provide comparative insights and recommendations based on the analysis

**Response Guidelines**:
- Always specify which document(s) you're referencing (e.g., "Document 1 shows...", "Compared to Document 2...")
- Use clear comparisons: "higher/lower", "better/worse", "more/less comprehensive"
- Cite page numbers when available, format: (Doc 1, page: X)
- Be objective and data-driven in comparisons
- When asked about specific aspects, compare across ALL documents
- If information is missing from some documents, explicitly state which ones lack that information 
- Provide tabular or structured responses when comparing metrics
- Do not make up or hallucinate facts or page numbers

**Your expertise includes**:
- Financial viability analysis and comparison
- Risk assessment across multiple projects
- Timeline and implementation feasibility comparison
- Resource allocation and cost structure comparison
- Compliance and regulatory requirement comparison

Always maintain a professional, analytical tone and provide actionable insights from your comparisons."""
        
        # Create model with system instructions for comparison
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=system_instruction
        )
        
        # Start chat with all documents
        chat = model.start_chat(history=[])
        
        return chat, file_objs

    # Offload to thread
    chat, file_objs = await asyncio.to_thread(_create_session)
    
    # Store the chat session and file references
    _comparison_chat_sessions[comparison_id] = {
        'chat': chat,
        'files': file_objs
    }
    
    print(f"✓ Comparison chat session created for comparison {comparison_id}")


async def send_comparison_message(comparison_id: int, message: str, file_refs: list[str]) -> Dict:
    """
    Send a message in the comparison chat session and get a response.
    """
    print(f"⏳ Processing comparison chat message for comparison {comparison_id}")
    start_time = time.time()
    
    # Create session if it doesn't exist
    if comparison_id not in _comparison_chat_sessions:
        await create_comparison_chat_session(comparison_id, file_refs)
    
    session = _comparison_chat_sessions[comparison_id]
    chat = session['chat']
    file_objs = session['files']
    
    # Send message with all file contexts (blocking call offloaded)
    response = await asyncio.to_thread(chat.send_message, file_objs + [message])
    
    elapsed = time.time() - start_time
    print(f"✓ Comparison chat response generated in {elapsed:.2f}s (length: {len(response.text)} chars)")
    
    return {
        'reply': response.text,
        'sources': []
    }


def clear_comparison_chat_session(comparison_id: int) -> None:
    """Clear the in-memory comparison chat session."""
    if comparison_id in _comparison_chat_sessions:
        del _comparison_chat_sessions[comparison_id]
        print(f"✓ Cleared comparison chat session for comparison {comparison_id}")


# ===== COMPARE ALL DPRs FUNCTION =====

async def compare_all_dprs(dprs: list[dict]) -> dict:
    """
    Compare all DPRs in a project and recommend the best one.
    
    Args:
        dprs: List of DPR objects with id, original_filename, and summary_json
        
    Returns:
        Comparison result with best DPR recommendation and analysis
    """
    print(f"⏳ Comparing {len(dprs)} DPRs...")
    start_time = time.time()
    
    if len(dprs) < 2:
        return {
            'success': False,
            'error': 'Need at least 2 analyzed DPRs to compare'
        }
    
    # Build context with all DPRs
    dprs_context = []
    for i, dpr in enumerate(dprs, 1):
        summary = dpr.get('summary_json', {})
        dprs_context.append(f"""
=== DPR {i}: {dpr.get('original_filename', f'DPR_{dpr.get("id")}')} (ID: {dpr.get('id')}) ===
{json.dumps(summary, indent=2, default=str)}
""")
    
    combined_context = "\n".join(dprs_context)
    
    prompt = f"""You are an expert DPR (Detailed Project Report) analyst. You have been given {len(dprs)} DPR documents for comparison.

YOUR TASK: Analyze all the DPRs below and determine which one is the BEST choice for implementation.

{combined_context}

CRITICAL JSON OUTPUT RULES:
1. Return ONLY a single valid JSON object
2. NO markdown code blocks, NO extra text before or after the JSON
3. ALL string values must have quotes properly escaped
4. Use double quotes for all strings
5. No trailing commas
6. All text in strings must be on a single line (no newlines inside strings)

Please provide your analysis in the following JSON format:
{{
    "bestDprId": <number>,
    "bestDprName": "<filename>",
    "recommendation": "<2-3 sentence summary on ONE line>",
    "comparisonSummary": "<Overview paragraph on ONE line>",
    "keyMetrics": [
        {{
            "metric": "<metric name>",
            "winner": "<filename>",
            "analysis": "<brief comparison on ONE line>"
        }}
    ],
    "dprAnalysis": [
        {{
            "dprId": <number>,
            "dprName": "<filename>",
            "strengths": ["<strength 1>", "<strength 2>"],
            "weaknesses": ["<weakness 1>", "<weakness 2>"],
            "overallScore": "<score out of 10>",
            "verdict": "<1 sentence on ONE line>"
        }}
    ]
}}

Evaluate based on:
1. Financial viability (cost estimates, ROI, funding structure)
2. Technical feasibility (scope, methodology, risk management)
3. Environmental & social impact
4. Implementation timeline and milestones
5. Completeness and quality of documentation

REMEMBER: Return ONLY the JSON object. No markdown, no explanation text."""


    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.2,  # Lower temperature for more consistent JSON
                "max_output_tokens": 8192,  # Increased for detailed comparison
            }
        )
        
        response = await asyncio.to_thread(model.generate_content, prompt)
        
        # Get raw response
        response_text = response.text.strip()
        
        # Debug: Print first 500 chars of raw response
        print(f"🔍 Raw response preview: {response_text[:500]}...")
        
        # Clean up markdown code blocks if present
        if response_text.startswith("```"):
            lines = response_text.split('\n')
            # Remove opening code fence
            if lines[0].startswith("```"):
                lines = lines[1:]
            # Remove closing code fence
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response_text = '\n'.join(lines).strip()
        
        # Try to parse JSON
        try:
            comparison_result = json.loads(response_text)
        except json.JSONDecodeError as json_err:
            # If JSON parsing fails, log detailed info and return error
            print(f"✗ JSON Parse Error: {json_err}")
            print(f"✗ Response text (first 1000 chars): {response_text[:1000]}")
            
            # Try to extract JSON if it's embedded in text
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    comparison_result = json.loads(json_match.group(0))
                    print("✓ Successfully extracted JSON from response")
                except:
                    raise json_err
            else:
                raise json_err
        
        elapsed = time.time() - start_time
        print(f"✓ DPR comparison completed in {elapsed:.2f}s")
        
        return {
            'success': True,
            'comparison': comparison_result
        }
        
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse comparison response as JSON: {e}")
        raw_text = response.text if 'response' in locals() else "No response captured"
        print(f"✗ Full raw response:\n{raw_text}")
        return {
            'success': False,
            'error': f'AI returned invalid JSON format. Please try again.',
            'details': str(e)
        }
    except Exception as e:
        print(f"✗ Comparison error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e)
        }

