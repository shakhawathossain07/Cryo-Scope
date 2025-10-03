/**
 * NASA-Grade Scientific Report Generation Service
 * Uses OpenRouter with Gemini 2.0 Flash Experimental to generate comprehensive research reports
 * based on real-time dashboard data from transparent-dashboard API
 */

import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface DashboardData {
  regionTemperatureData: Array<{
    regionId: string;
    regionName: string;
    temperature: {
      current: number;
      anomaly: number;
      max: number;
      min: number;
      dataSource: {
        type: string;
        source: string;
        confidence: number;
        version?: string;
        doi?: string;
        validation?: {
          r_squared?: number;
          rmse?: number;
          bias?: number;
          n_samples?: number;
        };
      };
    };
    confidence: number;
  }>;
  regionMethaneSummary: Array<{
    regionId: string;
    regionName: string;
    methane: {
      concentration: number;
      unit: string;
      dataSource: {
        type: string;
        source: string;
        confidence: number;
        algorithm?: string;
        validation?: {
          r_squared?: number;
          rmse?: number;
          bias?: number;
        };
      };
    };
  }>;
  riskZones: Array<{
    regionId: string;
    regionName: string;
    riskLevel: string;
    riskScore: number;
    factors: {
      temperatureAnomaly: number;
      estimatedMethane: number;
      geographicRisk: boolean;
    };
    dataSource: {
      confidence: number;
      validation?: {
        accuracy?: number;
        false_positive_rate?: number;
        false_negative_rate?: number;
      };
    };
  }>;
}

export interface ScientificReport {
  title: string;
  executiveSummary: string;
  methodology: string;
  findings: string;
  dataQuality: string;
  riskAssessment: string;
  recommendations: string;
  citations: string;
  fullReport: string;
  generatedAt: string;
}

/**
 * Generate a NASA-grade scientific report from dashboard data
 */
export async function generateScientificReport(
  dashboardData: DashboardData,
  regionFilter?: string
): Promise<ScientificReport> {
  // Filter data if region specified
  let filteredData = dashboardData;
  if (regionFilter) {
    const regionLower = regionFilter.toLowerCase();
    filteredData = {
      regionTemperatureData: dashboardData.regionTemperatureData.filter(
        r => r.regionId.toLowerCase() === regionLower || r.regionName.toLowerCase().includes(regionLower)
      ),
      regionMethaneSummary: dashboardData.regionMethaneSummary.filter(
        r => r.regionId.toLowerCase() === regionLower || r.regionName.toLowerCase().includes(regionLower)
      ),
      riskZones: dashboardData.riskZones.filter(
        r => r.regionId.toLowerCase() === regionLower || r.regionName.toLowerCase().includes(regionLower)
      ),
    };
  }

  const prompt = `You are a senior NASA climate scientist and data science engineer preparing a peer-review quality research report for publication in Nature Climate Change or Science.

MISSION CRITICAL DATA (October 3, 2025):
${JSON.stringify(filteredData, null, 2)}

Generate a rigorous, publication-ready scientific report following NASA technical memorandum standards (NASA/TM format):

═══════════════════════════════════════════════════════════════════════════

1. TITLE & METADATA
   Create a precise, informative title following NASA format:
   "Quantitative Assessment of [Specific Topic]: [Geographic Scope] - [Temporal Scope]"
   Include: Report ID, Date, Authors (NASA GISS/JPL format), DOI placeholder

═══════════════════════════════════════════════════════════════════════════

2. ABSTRACT (250-300 words) - Publication Quality
   Structure using IMRaD format:
   • INTRODUCTION: Context and significance (2-3 sentences)
   • METHODS: Data sources and analytical approach (2-3 sentences)
   • RESULTS: Key quantitative findings with exact values and uncertainty bounds (3-4 sentences)
   • DISCUSSION: Implications and significance (2-3 sentences)
   
   CRITICAL: Include specific numerical results, confidence intervals, and statistical significance

═══════════════════════════════════════════════════════════════════════════

3. INTRODUCTION (300-400 words) - Scientific Context
   • Arctic climate change context and permafrost-carbon feedback mechanisms
   • Current state of knowledge (reference provided citations)
   • Knowledge gaps this analysis addresses
   • Specific objectives of this assessment
   • Hypothesis or research questions being investigated
   
   Use past tense for completed work, present tense for established facts

═══════════════════════════════════════════════════════════════════════════

4. DATA SOURCES & METHODOLOGY (500-600 words) - Data Science Rigor
   
   4.1 DATA ACQUISITION
   • NASA POWER API v9.0.1: Temporal resolution, spatial coverage, latency
   • Copernicus Sentinel-5P TROPOMI: Instrument specifications, swath width (~2600km), spatial resolution (~7km)
   • Processing pipeline: data ingestion → quality control → validation → integration
   
   4.2 TEMPERATURE ANALYSIS
   • Baseline: 1991-2020 WMO climatological standard
   • Anomaly calculation: ΔT = T_observed - T_baseline
   • Uncertainty: σ_T = ±1.8°C (1σ confidence interval)
   • Validation metrics from data: R², RMSE, bias
   
   4.3 METHANE QUANTIFICATION
   • Direct measurements: Sentinel-5P column-averaged dry-air mole fraction (XCH₄)
   • Correlation model: [CH₄] = [CH₄]_baseline + (12 ± 4) PPB/°C × ΔT + R_factors
   • Regional factors (R): Geographic vulnerability, permafrost extent, wetland coverage
   • Uncertainty propagation: σ_CH₄ = ±60 PPB (combined instrumental and model uncertainty)
   
   4.4 RISK ASSESSMENT ALGORITHM
   • Multi-factor scoring: Risk_Score = w₁×T_anomaly + w₂×CH₄_concentration + w₃×Geographic_factors
   • Threshold classification: CRITICAL (>80), HIGH (60-80), MEDIUM (40-60), LOW (<40)
   • Validation: 84% overall accuracy, 92% for HIGH/CRITICAL classification
   • False positive rate, false negative rate (from data)
   
   4.5 QUALITY ASSURANCE
   • Data provenance tracking
   • Automated quality flags
   • Cross-validation with independent datasets
   • Confidence scoring methodology

═══════════════════════════════════════════════════════════════════════════

5. RESULTS (700-800 words) - Quantitative Analysis
   
   5.1 REGIONAL TEMPERATURE ANOMALIES
   For EACH region, report in standardized format:
   • Region name and coordinates
   • Current temperature: X.XX ± Y.YY°C
   • Anomaly: ΔT = +X.XX°C (relative to 1991-2020 baseline)
   • Confidence level: XX%
   • Temporal trend interpretation
   • Statistical significance (if p-values available)
   
   5.2 METHANE CONCENTRATIONS
   For EACH region:
   • Observed concentration: XXXX ± YY PPB
   • Comparison to Arctic baseline (~1850 PPB)
   • Percentage above/below regional average
   • Data source (direct measurement vs. correlation model)
   • Temporal variability
   
   5.3 SPATIAL PATTERNS & CORRELATIONS
   • Cross-regional comparison using exact values from data
   • Temperature-methane correlation strength
   • Geographic gradients (latitude/longitude dependencies)
   • Explanation of spatial heterogeneity
   • Statistical relationships (correlation coefficients if available)
   
   5.4 RISK CLASSIFICATION
   Table format for each region:
   | Region | Risk Level | Risk Score | T Anomaly | CH₄ (PPB) | Confidence |
   Use exact values from provided data

═══════════════════════════════════════════════════════════════════════════

6. DATA QUALITY & UNCERTAINTY ANALYSIS (400-500 words) - Critical Assessment
   
   6.1 MEASUREMENT RELIABILITY
   • Confidence scores by data type (temperature: XX%, methane: XX%)
   • Validation metrics: R² values, RMSE, bias statistics
   • Comparison with independent observations
   
   6.2 SOURCES OF UNCERTAINTY
   • Instrumental uncertainty (measurement precision)
   • Model uncertainty (parameterization, assumptions)
   • Spatial uncertainty (grid resolution, interpolation)
   • Temporal uncertainty (sampling frequency, latency)
   
   6.3 UNCERTAINTY PROPAGATION
   • How uncertainties combine in derived quantities
   • Impact on risk classification accuracy
   • Sensitivity analysis results
   
   6.4 DATA LIMITATIONS
   • Temporal coverage gaps
   • Spatial resolution constraints
   • Model assumptions and their validity
   • Recommendations for improved data collection

═══════════════════════════════════════════════════════════════════════════

7. DISCUSSION (500-600 words) - Scientific Interpretation
   
   7.1 FINDINGS IN CONTEXT
   • Comparison with recent literature (cite provided references)
   • Agreement/disagreement with previous studies
   • Novel contributions of this analysis
   
   7.2 MECHANISTIC INTERPRETATION
   • Physical processes driving observed patterns
   • Permafrost-carbon feedback mechanisms
   • Role of geographic and anthropogenic factors
   
   7.3 CLIMATE IMPLICATIONS
   • Carbon cycle impacts
   • Climate forcing potential (radiative forcing calculations if possible)
   • Feedback loop amplification effects
   
   7.4 LIMITATIONS & CAVEATS
   • Assumptions and their implications
   • Known biases and corrections applied
   • Generalizability of findings

═══════════════════════════════════════════════════════════════════════════

8. RISK ASSESSMENT & MONITORING PRIORITIES (400-500 words)
   
   8.1 CRITICAL ZONES (RISK SCORE >80)
   • Specific identification with coordinates
   • Immediate threats and timescales
   • Required monitoring frequency
   
   8.2 HIGH-RISK ZONES (RISK SCORE 60-80)
   • Medium-term concerns
   • Enhanced observation requirements
   
   8.3 MONITORING RECOMMENDATIONS
   • Sensor deployment priorities (specific instruments)
   • Temporal resolution requirements (hourly/daily/weekly)
   • Integration with existing networks (NOAA, ESA, JAXA)
   • Data sharing protocols

═══════════════════════════════════════════════════════════════════════════

9. RECOMMENDATIONS (350-450 words) - Actionable Outputs
   
   9.1 SCIENTIFIC PRIORITIES
   • Research gaps requiring immediate attention
   • Proposed field campaigns or satellite missions
   • Modeling improvements needed
   
   9.2 OPERATIONAL MONITORING
   • Infrastructure for continuous observation
   • Early warning system development
   • Data pipeline optimization
   
   9.3 POLICY & ADAPTATION
   • Science-policy interface recommendations
   • Risk communication strategies
   • Stakeholder engagement frameworks
   
   9.4 DATA SCIENCE & ENGINEERING
   • Algorithm refinement priorities
   • Machine learning integration opportunities
   • Real-time processing capabilities
   • API and data accessibility improvements

═══════════════════════════════════════════════════════════════════════════

10. CONCLUSIONS (200-250 words)
    • Restate key findings with specific values
    • Significance for Arctic climate science
    • Implications for global carbon budget
    • Future research directions
    • Final assessment statement

═══════════════════════════════════════════════════════════════════════════

11. REFERENCES (Cite ALL provided sources in proper format)
    Use Nature citation style:
    
    1. Schuur, E. A. G. et al. Climate change and the permafrost carbon feedback. Nature 520, 171–179 (2015). https://doi.org/10.1038/nature14338
    
    2. Turetsky, M. R. et al. Carbon release through abrupt permafrost thaw. Nat. Geosci. 13, 138–143 (2020). https://doi.org/10.1038/s41561-019-0526-0
    
    3. Walter Anthony, K. M. et al. 21st-century modeled permafrost carbon emissions accelerated by abrupt thaw beneath lakes. Nat. Commun. 9, 3262 (2018). https://doi.org/10.1038/s41467-018-05738-9
    
    4. Brown, J., Ferrians, O. J., Heginbottom, J. A. & Melnikov, E. S. Circum-Arctic Map of Permafrost and Ground-Ice Conditions. U.S. Geol. Surv. Circum-Pac. Map Ser. CP-45 (2002). https://doi.org/10.3133/cp45
    
    5. Grosse, G. et al. Vulnerability of high-latitude soil organic carbon in North America to disturbance. J. Geophys. Res. 116, G00K06 (2011). https://doi.org/10.1029/2010JG001507
    
    6. Romanovsky, V. E. et al. Thermal state of permafrost in Russia. Permafr. Periglac. Process. 21, 136–155 (2010). https://doi.org/10.1002/ppp.683
    
    7. Jorgenson, M. T., Shur, Y. L. & Pullman, E. R. Abrupt increase in permafrost degradation in Arctic Alaska. Geophys. Res. Lett. 33, L02503 (2006). https://doi.org/10.1029/2005GL024960
    
    8. Shakhova, N. et al. Extensive methane venting to the atmosphere from sediments of the East Siberian Arctic Shelf. Science 327, 1246–1250 (2010). https://doi.org/10.1126/science.1182221
    
    9. NOAA Arctic Report Card 2024. https://arctic.noaa.gov/Report-Card
    
    10. NASA POWER Project. https://doi.org/10.5067/POWER/v9.0.1

═══════════════════════════════════════════════════════════════════════════

12. APPENDICES (if needed)
    A. Supplementary Data Tables
    B. Algorithm Pseudocode
    C. Quality Control Procedures
    D. Acronyms and Abbreviations

═══════════════════════════════════════════════════════════════════════════

CRITICAL REQUIREMENTS FOR NASA/DATA SCIENCE ACCEPTANCE:

✓ Use EXACT numerical values from provided data (do not round excessively)
✓ Include uncertainty estimates for ALL quantitative results
✓ Report confidence intervals using standard notation (±σ)
✓ Use SI units consistently (°C, PPB, km², etc.)
✓ Maintain objective, third-person scientific voice
✓ Use past tense for completed analysis, present tense for general facts
✓ Include statistical validation metrics where available
✓ Reference data provenance for every result
✓ Follow NASA technical report formatting standards
✓ Ensure reproducibility (methods described with sufficient detail)
✓ Acknowledge limitations and uncertainties explicitly
✓ Use standard scientific nomenclature and acronyms
✓ Format tables and data systematically
✓ Cross-reference sections appropriately
✓ Total length: 2500-3500 words (full scientific rigor)

Generate the complete, publication-quality report now.`;

  const completion = await openai.chat.completions.create({
    model: 'google/gemini-2.0-flash-exp:free',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const fullReport = completion.choices[0]?.message?.content || '';

  // Parse sections with enhanced extraction for NASA-grade reports
  const sections = {
    title: extractSection(fullReport, 'TITLE', 'ABSTRACT') || 
           extractSection(fullReport, 'TITLE', 'EXECUTIVE SUMMARY') ||
           extractTitle(fullReport) ||
           'Arctic Permafrost and Methane Emissions Assessment',
    executiveSummary: extractSection(fullReport, 'ABSTRACT', 'INTRODUCTION') || 
                      extractSection(fullReport, 'EXECUTIVE SUMMARY', 'INTRODUCTION') ||
                      extractSection(fullReport, 'ABSTRACT', 'METHODOLOGY') ||
                      fullReport.substring(0, 800),
    methodology: extractSection(fullReport, 'DATA SOURCES & METHODOLOGY', 'RESULTS') || 
                 extractSection(fullReport, 'METHODOLOGY', 'RESULTS') ||
                 extractSection(fullReport, 'METHODOLOGY', 'FINDINGS') || '',
    findings: extractSection(fullReport, 'RESULTS', 'DATA QUALITY') || 
              extractSection(fullReport, 'FINDINGS', 'DATA QUALITY') ||
              extractSection(fullReport, 'RESULTS', 'DISCUSSION') || '',
    dataQuality: extractSection(fullReport, 'DATA QUALITY & UNCERTAINTY ANALYSIS', 'DISCUSSION') || 
                 extractSection(fullReport, 'DATA QUALITY', 'DISCUSSION') ||
                 extractSection(fullReport, 'DATA QUALITY', 'RISK ASSESSMENT') || '',
    riskAssessment: extractSection(fullReport, 'RISK ASSESSMENT & MONITORING PRIORITIES', 'RECOMMENDATIONS') || 
                    extractSection(fullReport, 'RISK ASSESSMENT', 'RECOMMENDATIONS') ||
                    extractSection(fullReport, 'DISCUSSION', 'RECOMMENDATIONS') || '',
    recommendations: extractSection(fullReport, 'RECOMMENDATIONS', 'CONCLUSIONS') || 
                     extractSection(fullReport, 'RECOMMENDATIONS', 'REFERENCES') ||
                     extractSection(fullReport, 'RECOMMENDATIONS', 'CITATIONS') || '',
    citations: extractSection(fullReport, 'REFERENCES', 'APPENDICES') || 
               extractSection(fullReport, 'REFERENCES', null) ||
               extractSection(fullReport, 'CITATIONS', null) || '',
  };

  return {
    ...sections,
    fullReport,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Extract the title from the report (handles various formats)
 */
function extractTitle(text: string): string {
  // Try to find a title in various formats
  const patterns = [
    /^#+\s*(.+?)(?:\n|$)/m,  // Markdown header
    /^TITLE[:\s]*(.+?)(?:\n|$)/im,  // "TITLE: ..."
    /^1\.\s*TITLE[:\s]*(.+?)(?:\n|$)/im,  // "1. TITLE: ..."
    /^"(.+?)"(?:\n|$)/m,  // Quoted title
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

/**
 * Extract a section from the full report text with enhanced pattern matching
 */
function extractSection(text: string, startMarker: string, endMarker: string | null): string {
  const patterns = [
    // Pattern 1: Direct match with separator lines
    new RegExp(`═+\\s*\\n+\\s*\\d*\\.?\\s*${startMarker}[:\\s]*.*?\\n+═+\\s*\\n+([\\s\\S]*?)(?=${endMarker ? '═+\\s*\\n+\\s*\\d*\\.?\\s*' + endMarker : '$'})`, 'i'),
    
    // Pattern 2: Numbered sections with colon
    new RegExp(`\\d+\\.\\s*${startMarker}[:\\s]*.*?\\n([\\s\\S]*?)(?=${endMarker ? '\\n+\\d+\\.\\s*' + endMarker : '$'})`, 'i'),
    
    // Pattern 3: Markdown headers
    new RegExp(`#+\\s*${startMarker}[:\\s]*.*?\\n([\\s\\S]*?)(?=${endMarker ? '#+\\s*' + endMarker : '$'})`, 'i'),
    
    // Pattern 4: Simple section headers
    new RegExp(`${startMarker}[:\\s]*\\n+([\\s\\S]*?)(?=${endMarker ? '\\n+' + endMarker : '$'})`, 'i'),
    
    // Pattern 5: Uppercase section headers
    new RegExp(`${startMarker.toUpperCase()}[:\\s]*.*?\\n([\\s\\S]*?)(?=${endMarker ? '\\n+' + endMarker.toUpperCase() : '$'})`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 50) {  // Ensure we got substantial content
      return match[1].trim();
    }
  }

  return '';
}

/**
 * Generate a quick summary for a specific region
 */
export async function generateRegionSummary(
  dashboardData: DashboardData,
  regionName: string
): Promise<string> {
  const regionData = {
    temperature: dashboardData.regionTemperatureData.find(
      r => r.regionName.toLowerCase().includes(regionName.toLowerCase())
    ),
    methane: dashboardData.regionMethaneSummary.find(
      r => r.regionName.toLowerCase().includes(regionName.toLowerCase())
    ),
    risk: dashboardData.riskZones.find(
      r => r.regionName.toLowerCase().includes(regionName.toLowerCase())
    ),
  };

  const prompt = `As a NASA scientist, provide a 150-word summary of this Arctic region's current state:

REGION: ${regionName}
DATA: ${JSON.stringify(regionData, null, 2)}

Include:
- Temperature anomaly and what it means
- Methane concentration and risk level
- Data confidence levels
- Key concern or priority

Be concise, scientific, and actionable.`;

  const completion = await openai.chat.completions.create({
    model: 'google/gemini-2.0-flash-exp:free',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return completion.choices[0]?.message?.content || '';
}
