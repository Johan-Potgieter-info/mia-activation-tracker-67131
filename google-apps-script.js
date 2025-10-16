// Google Apps Script for Mia Healthcare Deployment Form
// 
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code and paste this entire script
// 4. Click "Deploy" > "New deployment"
// 5. Select type: "Web app"
// 6. Execute as: "Me"
// 7. Who has access: "Anyone"
// 8. Click "Deploy" and copy the deployment URL
// 9. Paste the URL into DeploymentForm.tsx where it says "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if this is the first submission (no headers)
    if (sheet.getLastRow() === 0) {
      // Create headers
      const headers = [
        "Timestamp",
        "Event Name",
        "Address",
        "Contact",
        "Team Lead",
        "Support Member",
        "Wellness Officer",
        "Start Time",
        "End Time",
        "People Engaged",
        "Bookings Captured",
        "Custom Metric 1 Name",
        "Custom Metric 1 Value",
        "Custom Metric 2 Name",
        "Custom Metric 2 Value",
        "Custom Metric 3 Name",
        "Custom Metric 3 Value",
        "Custom Metric 4 Name",
        "Custom Metric 4 Value",
        "Equipment",
        "Notes",
        "What Went Well",
        "What Needs Improvement",
        "Follow-up Actions"
      ];
      sheet.appendRow(headers);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#ef4805");
      headerRange.setFontColor("#ffffff");
    }
    
    // Prepare the row data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.eventName || "",
      data.address || "",
      data.contact || "",
      data.lead || "",
      data.support || "",
      data.officer || "",
      data.startTime || "",
      data.endTime || "",
      data.peopleEngaged || 0,
      data.bookings || 0,
      data.customMetric1Name || "",
      data.customMetric1Value || "",
      data.customMetric2Name || "",
      data.customMetric2Value || "",
      data.customMetric3Name || "",
      data.customMetric3Value || "",
      data.customMetric4Name || "",
      data.customMetric4Value || "",
      data.equipment || "",
      data.notes || "",
      data.success || "",
      data.improve || "",
      data.actions || ""
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability (optional)
    sheet.autoResizeColumns(1, rowData.length);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data submitted successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log error for debugging
    Logger.log("Error: " + error.toString());
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script is working
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        eventName: "Test Event",
        address: "123 Test St",
        contact: "John Doe - 082 123 4567",
        lead: "Johan Potgieter (JP)",
        support: "Sethu Lucas (SL)",
        officer: "Stefan Schoof (SS)",
        startTime: "09:00",
        endTime: "17:00",
        peopleEngaged: 50,
        bookings: 25,
        customMetric1Name: "Test Metric 1",
        customMetric1Value: 10,
        equipment: "Clipboards, Demo Kit",
        notes: "Test notes",
        success: "Everything went well",
        improve: "Could improve timing",
        actions: "Follow up next week"
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
