/**
 * Test Script: NASA-Grade Scientific Report Generation
 * 
 * Tests the new report generation system with real dashboard data
 */

console.log('🧪 Testing NASA-Grade Scientific Report Generation\n');
console.log('=' .repeat(60));

async function testReportGeneration() {
  const baseUrl = 'http://localhost:9002';

  // Test 1: Dashboard API connectivity
  console.log('\n📊 Test 1: Dashboard API Connectivity');
  console.log('-'.repeat(60));
  try {
    const dashboardResponse = await fetch(`${baseUrl}/api/transparent-dashboard`);
    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard API returned ${dashboardResponse.status}`);
    }
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard API is responding');
    console.log(`   - Regions: ${dashboardData.regionMethaneSummary.length}`);
    console.log(`   - Temperature data available: ${dashboardData.realTemperatureData.length} regions`);
    console.log(`   - Methane data available: ${dashboardData.regionMethaneSummary.length} regions`);
  } catch (error) {
    console.error('❌ Dashboard API failed:', error.message);
    return;
  }

  // Test 2: Environment variable check
  console.log('\n🔑 Test 2: Gemini API Key Configuration');
  console.log('-'.repeat(60));
  const hasApiKey = process.env.GEMINI_API_KEY ? true : false;
  if (hasApiKey) {
    console.log('✅ GEMINI_API_KEY is configured');
    console.log(`   - Key starts with: ${process.env.GEMINI_API_KEY.substring(0, 15)}...`);
  } else {
    console.error('❌ GEMINI_API_KEY is not set in environment');
    console.error('   Please check .env.local file');
    return;
  }

  // Test 3: Generate quick summary for one region
  console.log('\n⚡ Test 3: Quick Summary Generation (Alaska)');
  console.log('-'.repeat(60));
  console.log('Requesting quick summary from Gemini AI...');
  try {
    const startTime = Date.now();
    const summaryResponse = await fetch(`${baseUrl}/api/generate-report?region=alaska&format=summary`);
    const summaryTime = Date.now() - startTime;
    
    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.json();
      throw new Error(errorData.details || 'Summary generation failed');
    }
    
    const summaryData = await summaryResponse.json();
    console.log(`✅ Summary generated in ${(summaryTime / 1000).toFixed(1)} seconds`);
    console.log(`   - Region: ${summaryData.region}`);
    console.log(`   - Format: ${summaryData.format}`);
    console.log(`   - Summary length: ${summaryData.summary.length} characters`);
    console.log('\n📄 Summary Preview:');
    console.log('   ' + summaryData.summary.substring(0, 200) + '...\n');
  } catch (error) {
    console.error('❌ Summary generation failed:', error.message);
    console.error('   This might be due to Gemini API issues or quota limits');
  }

  // Test 4: Generate full report for all regions
  console.log('\n📝 Test 4: Full Report Generation (All Regions)');
  console.log('-'.repeat(60));
  console.log('Requesting full scientific report from Gemini AI...');
  console.log('⏳ This may take 15-30 seconds...\n');
  try {
    const startTime = Date.now();
    const reportResponse = await fetch(`${baseUrl}/api/generate-report`);
    const reportTime = Date.now() - startTime;
    
    if (!reportResponse.ok) {
      const errorData = await reportResponse.json();
      throw new Error(errorData.details || 'Report generation failed');
    }
    
    const reportData = await reportResponse.json();
    console.log(`✅ Full report generated in ${(reportTime / 1000).toFixed(1)} seconds`);
    console.log('\n📊 Data Snapshot:');
    console.log(`   - Total Regions: ${reportData.dataSnapshot.totalRegions}`);
    console.log(`   - Avg Temperature Anomaly: +${reportData.dataSnapshot.avgTemperatureAnomaly}°C`);
    console.log(`   - Avg Methane Concentration: ${reportData.dataSnapshot.avgMethaneConcentration} PPB`);
    console.log(`   - High Risk Regions: ${reportData.dataSnapshot.highRiskRegions}`);
    
    console.log('\n📄 Report Structure:');
    console.log(`   - Title: ${reportData.report.title}`);
    console.log(`   - Executive Summary: ${reportData.report.executiveSummary.length} chars`);
    console.log(`   - Methodology: ${reportData.report.methodology.length} chars`);
    console.log(`   - Findings: ${reportData.report.findings.length} chars`);
    console.log(`   - Data Quality: ${reportData.report.dataQuality.length} chars`);
    console.log(`   - Risk Assessment: ${reportData.report.riskAssessment.length} chars`);
    console.log(`   - Recommendations: ${reportData.report.recommendations.length} chars`);
    console.log(`   - Citations: ${reportData.report.citations.length} chars`);
    console.log(`   - Full Report: ${reportData.report.fullReport.length} chars`);
    
    console.log('\n📝 Executive Summary Preview:');
    console.log('   ' + reportData.report.executiveSummary.substring(0, 300).replace(/\n/g, '\n   ') + '...\n');
    
    console.log('\n📚 Citations Preview:');
    const citationsPreview = reportData.report.citations.substring(0, 400).replace(/\n/g, '\n   ');
    console.log('   ' + citationsPreview + '...\n');
    
  } catch (error) {
    console.error('❌ Full report generation failed:', error.message);
    console.error('   This might be due to:');
    console.error('   - Gemini API quota exceeded');
    console.error('   - Network connectivity issues');
    console.error('   - API key invalid or expired');
  }

  // Test 5: Test regional report
  console.log('\n🌍 Test 5: Regional Report Generation (Siberia)');
  console.log('-'.repeat(60));
  console.log('Requesting focused report for Siberian Tundra...');
  try {
    const startTime = Date.now();
    const regionalResponse = await fetch(`${baseUrl}/api/generate-report?region=siberia`);
    const regionalTime = Date.now() - startTime;
    
    if (!regionalResponse.ok) {
      const errorData = await regionalResponse.json();
      throw new Error(errorData.details || 'Regional report generation failed');
    }
    
    const regionalData = await regionalResponse.json();
    console.log(`✅ Regional report generated in ${(regionalTime / 1000).toFixed(1)} seconds`);
    console.log(`   - Region: ${regionalData.region}`);
    console.log(`   - Report length: ${regionalData.report.fullReport.length} characters`);
    console.log('\n📄 Findings Preview (Siberia):');
    console.log('   ' + regionalData.report.findings.substring(0, 250).replace(/\n/g, '\n   ') + '...\n');
  } catch (error) {
    console.error('❌ Regional report generation failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Testing Complete!');
  console.log('\n📚 Next Steps:');
  console.log('   1. Open browser to http://localhost:9002');
  console.log('   2. Navigate to "Risk Reporting" section');
  console.log('   3. Select region and click "Generate Scientific Report"');
  console.log('   4. Download report as TXT or Markdown');
  console.log('\n📖 Documentation:');
  console.log('   - Full guide: docs/SCIENTIFIC_REPORT_GENERATION.md');
  console.log('   - Quick start: docs/QUICK_START_REPORTS.md');
  console.log('   - NASA certification: docs/NASA_RESEARCH_GRADE_CERTIFICATION.md');
  console.log('='.repeat(60) + '\n');
}

// Run tests
testReportGeneration().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
