// This is a PowerShell script to truncate the file at line 784
$content = Get-Content 'c:\Users\icmas\OneDrive\Documents\vadtrans\client\src\pages\company\CompanyProfile.jsx' -TotalCount 784
$content | Set-Content 'c:\Users\icmas\OneDrive\Documents\vadtrans\client\src\pages\company\CompanyProfile.jsx' -Encoding UTF8
