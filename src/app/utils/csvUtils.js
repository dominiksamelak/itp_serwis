export const exportReportsToCSV = (reports) => {
  // Convert reports object to array of all reports
  const allReports = Object.entries(reports).flatMap(([status, reportList]) =>
    reportList.map(report => ({
      ...report,
      status
    }))
  );

  // Define CSV headers
  const headers = ['ID', 'Title', 'Client', 'Date', 'Description', 'Status'];

  // Convert reports to CSV rows
  const rows = allReports.map(report => [
    report.id,
    report.title,
    report.client,
    report.date,
    report.description,
    report.status
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importReportsFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        
        // Validate headers
        const requiredHeaders = ['ID', 'Title', 'Client', 'Date', 'Description', 'Status'];
        const isValidHeaders = requiredHeaders.every(header => 
          headers.includes(header)
        );

        if (!isValidHeaders) {
          throw new Error('Invalid CSV format: Missing required headers');
        }

        // Parse CSV rows
        const reports = {};
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;

          const values = rows[i].split(',').map(value => 
            value.trim().replace(/^"|"$/g, '')
          );

          const report = {
            id: parseInt(values[0]),
            title: values[1],
            client: values[2],
            date: values[3],
            description: values[4]
          };

          const status = values[5];
          if (!reports[status]) {
            reports[status] = [];
          }
          reports[status].push(report);
        }

        resolve(reports);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading CSV file'));
    };

    reader.readAsText(file);
  });
}; 