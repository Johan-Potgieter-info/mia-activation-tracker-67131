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

// Helper function to generate unique submission ID
function generateSubmissionId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `MIA-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

// Helper function to extract date from ISO timestamp (YYYY-MM-DD)
function getDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to find duplicate row
function findDuplicateRow(sheet, eventName, startTime, submissionDate) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null; // No data rows yet (only headers or empty)
  
  // Get all data (skip header row)
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = dataRange.getValues();
  
  // Column indices (adjust if you change header order)
  const TIMESTAMP_COL = 1; // Column B (index 1)
  const EVENT_NAME_COL = 2; // Column C (index 2)
  const START_TIME_COL = 7; // Column H (index 7)
  
  // Search for duplicate
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rowTimestamp = row[TIMESTAMP_COL];
    const rowEventName = row[EVENT_NAME_COL];
    const rowStartTime = row[START_TIME_COL];
    
    // Check if row matches: same event name, start time, and date
    if (rowEventName === eventName && rowStartTime === startTime) {
      const rowDate = getDateFromTimestamp(rowTimestamp);
      if (rowDate === submissionDate) {
        return i + 2; // Return actual row number (add 2: 1 for header, 1 for 0-index)
      }
    }
  }
  
  return null; // No duplicate found
}

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.eventName || !data.startTime) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Missing required fields: eventName and startTime are required"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if this is the first submission (no headers)
    if (sheet.getLastRow() === 0) {
      // Create headers with Submission ID as first column
      const headers = [
        "Submission ID",
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
    
    const timestamp = data.timestamp || new Date().toISOString();
    const submissionDate = getDateFromTimestamp(timestamp);
    
    // Check for duplicate
    const duplicateRow = findDuplicateRow(sheet, data.eventName, data.startTime, submissionDate);
    
    let submissionId;
    let action;
    
    if (duplicateRow) {
      // UPDATE existing row (keep the same submission ID)
      const existingId = sheet.getRange(duplicateRow, 1).getValue();
      submissionId = existingId;
      action = "updated";
      
      // Prepare the row data (without ID, as we keep existing)
      const rowData = [
        submissionId, // Keep existing ID
        timestamp,
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
      
      // Update the entire row
      const updateRange = sheet.getRange(duplicateRow, 1, 1, rowData.length);
      updateRange.setValues([rowData]);
      
    } else {
      // INSERT new row
      submissionId = generateSubmissionId();
      action = "created";
      
      // Prepare the row data
      const rowData = [
        submissionId,
        timestamp,
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
    }
    
    // Auto-resize columns for better readability (optional)
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    // Return success response with submission details
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: action,
      submissionId: submissionId,
      message: action === "created" 
        ? "New deployment report created successfully" 
        : "Deployment report updated successfully"
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
