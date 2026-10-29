/**
 * ==============================================================================
 * SmileCraft Dental Studio — 1-Click Google Sheet Populator & Live Sync Engine
 * Target Sheet: https://docs.google.com/spreadsheets/d/1qVZy6blS90dD3-PIK1LH_neDfO1vLy3wV8XMWXy9Rtw/edit
 * ==============================================================================
 */

var SPREADSHEET_ID = "1qVZy6blS90dD3-PIK1LH_neDfO1vLy3wV8XMWXy9Rtw";

/**
 * ⚡ 1. CLICK RUN (▶️) ON THIS FUNCTION TO POPULATE YOUR SHEET IMMEDIATELY!
 *    Populates Contacts (58 patients), Bookings (97 appointments with Patient No. and NO Amount),
 *    and Feedback directly into your Google Sheet tabs with green headers!
 */
function populateSheetNow() {
  var ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Could not open spreadsheet. Please ensure this script is inside Extensions > Apps Script in your Google Sheet.");
  }

  // 1. Contacts Data
  var contacts = [
    ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Email", "Visits"],
    [1,"#1","Manli","9909221670","yap532002@gmail.com",1],
    [2,"#2","Test FollowUp Patient","9876543211","—",1],
    [3,"#3","anadi tajapar","9664681536","yap532002@gmail.com",1],
    [4,"#4","Marcus Brody","+15559464972","marcus.1793192621749@example.com",1],
    [5,"#5","Marcus Brody","+15554208287","marcus.1793192282438@example.com",1],
    [6,"#6","Marcus Brody","+15558560836","marcus.1793191611026@example.com",1],
    [7,"#7","Marcus Brody","+15558764559","marcus.1793191388553@example.com",1],
    [8,"#8","Marcus Brody","+15558321266","marcus.1793191061597@example.com",1],
    [9,"#9","Marcus Brody","+15556843490","marcus.1793190332841@example.com",1],
    [10,"#10","Speed Test Patient 3","9876543212","—",1],
    [11,"#11","Speed Test Patient 2","9876543211","—",1],
    [12,"#12","Speed Test Patient","9876543210","—",1],
    [13,"#13","Perf Test","9123456784","—",1],
    [14,"#14","Speed Run Test","9123456783","—",1],
    [15,"#15","Speed Check After Fix","9123456782","speed3@example.com",1],
    [16,"#16","Speed Check After Optimization","9123456781","speed2@example.com",2],
    [17,"#17","Speed Check 2","9123456780","—",2],
    [18,"#18","Bench Mark","9123456789","—",1],
    [19,"#19","Speed Test","9123456789","speed@example.com",1],
    [20,"#20","Marcus Brody","+15554139757","marcus.1793189276119@example.com",1],
    [21,"#21","Priya Sharma","9876501234","priya.sharma@example.com",1],
    [22,"#22","Marcus Brody","+15558900017","marcus.1793188369117@example.com",1],
    [23,"#23","Marcus Brody","+15559152147","marcus.1793188297627@example.com",1],
    [24,"#24","Marcus Brody","+15555233088","marcus.1793188186836@example.com",1],
    [25,"#25","Marcus Brody","+15551263593","marcus.1793187807190@example.com",1],
    [26,"#26","Marcus Brody","+15554408810","marcus.1793187247931@example.com",1],
    [27,"#27","Marcus Brody","+15551409050","marcus.1793187184693@example.com",1],
    [28,"#28","Priya Patel","+91 99988 77766","—",1],
    [29,"#29","Test WalkIn Patient","+91 99999 11111","—",1],
    [30,"#30","Priya Sharma","+91 98222 33344","—",1],
    [31,"#31","Real Patient Test","+91 97777 55555","—",1],
    [32,"#32","Smooth Queue Patient","+91 98888 22222","—",1],
    [33,"#33","Test WalkIn Patient","+91 99999 11111","—",1],
    [34,"#34","Karan Desai","9825100099","—",1],
    [35,"#35","Test Walkin","9898012345","—",1],
    [36,"#36","Website Contact Patient","9825100000","—",1],
    [37,"#37","Amit Vora","0000000014","—",1],
    [38,"#38","Pooja Shah","+91 98765 43210","—",1],
    [39,"#39","manali","9664681536","yap532002@gmail.com",1],
    [40,"#40","Marcus Brody","+15555033437","marcus.1792821609492@example.com",2],
    [41,"#41","Marcus Brody","+15551617448","marcus.1792817970742@example.com",1],
    [42,"#42","Marcus Brody","+15552198854","marcus.1792816566737@example.com",1],
    [43,"#43","Arthur Dent","+15554321098","arthur.dent@example.com",16],
    [44,"#44","Fourth Patient 03:30 PM","9876543213","test4@example.com",1],
    [45,"#45","Third Patient 03:30 PM","9876543212","test3@example.com",1],
    [46,"#46","Second Patient 03:30 PM","9876543211","test2@example.com",1],
    [47,"#47","Test Conflict Resolution","9876543210","test@example.com",4],
    [48,"#48","anandi 5","9664681536","—",1],
    [49,"#49","Sneha Vora","+91 98980 99887","—",1],
    [50,"#50","anandi patel","9909221670","yap532002@gmail.com",2],
    [51,"#51","Sneha Joshi","+91 97234 66102","sneha.j@gmail.com",1],
    [52,"#52","Vikram Singhania","+91 94280 33219","vikram.singh@gmail.com",1],
    [53,"#53","Kavita Nair","+91 98240 77651","kavita.nair@hotmail.com",2],
    [54,"#54","Ananya Desai","+91 98980 55123","ananya.desai@gmail.com",2],
    [55,"#55","Rohan Patel","+91 99042 11985","rohan.p@yahoo.com",2],
    [56,"#56","Priya Sharma","+91 97123 88412","priya.sharma@outlook.com",8],
    [57,"#57","Aarav Mehta","+91 98251 44210","aarav.mehta@gmail.com",3],
    [58,"#58","yash patel","9664681536","yap532002@gmail.com",10]
  ];
  writeRawDataToSheet(ss, "Contacts", contacts);

  // 2. Bookings Data (No Amount, Patient No. Included)
  var bookings = [
    ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Service", "Date & Slot", "Doctor", "Status"],
    [1,"#22","Marcus Brody","+15558900017","General Consultation","Jan 12, 2027 • 9:22 AM","Dr. Deep Patel","CONFIRMED"],
    [2,"#26","Marcus Brody","+15554408810","General Consultation","Jan 10, 2027 • 3:04 AM","Dr. Deep Patel","CONFIRMED"],
    [3,"#23","Marcus Brody","+15559152147","General Consultation","Jan 6, 2027 • 2:21 AM","Dr. Deep Patel","CONFIRMED"],
    [4,"#5","Marcus Brody","+15554208287","General Consultation","Dec 31, 2026 • 9:28 AM","Dr. Deep Patel","CONFIRMED"],
    [5,"#9","Marcus Brody","+15556843490","General Consultation","Dec 30, 2026 • 9:55 AM","Dr. Deep Patel","CONFIRMED"],
    [6,"#20","Marcus Brody","+15554139757","General Consultation","Dec 25, 2026 • 6:37 AM","Dr. Deep Patel","CONFIRMED"],
    [7,"#7","Marcus Brody","+15558764559","General Consultation","Dec 23, 2026 • 11:13 AM","Dr. Deep Patel","CONFIRMED"],
    [8,"#8","Marcus Brody","+15558321266","General Consultation","Dec 20, 2026 • 3:07 AM","Dr. Deep Patel","CONFIRMED"],
    [9,"#42","Marcus Brody","+15552198854","General Consultation","Dec 18, 2026 • 6:06 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [10,"#6","Marcus Brody","+15558560836","General Consultation","Dec 17, 2026 • 7:16 PM","Dr. Deep Patel","CONFIRMED"],
    [11,"#40","Marcus Brody","+15555033437","General Consultation","Dec 13, 2026 • 6:30 AM","Dr. Sankar (Chief Dental Surgeon)","TREATMENT_DONE"],
    [12,"#25","Marcus Brody","+15551263593","General Consultation","Dec 10, 2026 • 12:13 PM","Dr. Deep Patel","CONFIRMED"],
    [13,"#41","Marcus Brody","+15551617448","General Consultation","Dec 7, 2026 • 3:29 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [14,"#27","Marcus Brody","+15551409050","General Consultation","Dec 5, 2026 • 12:03 PM","Dr. Deep Patel","CONFIRMED"],
    [15,"#4","Marcus Brody","+15559464972","General Consultation","Dec 3, 2026 • 2:33 AM","Dr. Deep Patel","CONFIRMED"],
    [16,"#24","Marcus Brody","+15555233088","General Consultation","Dec 2, 2026 • 2:19 AM","Dr. Deep Patel","CONFIRMED"],
    [17,"#17","Speed Check 2","9123456780","Root Canal Treatment (Endodontics)","Nov 5, 2026 • 4:15 PM","Dr. Deep Patel","PENDING"],
    [18,"#56","Priya Sharma","+91 97123 88412","Root Canal Treatment (Endodontics)","Nov 4, 2026 • 4:15 PM","Dr. Deep Patel","CONFIRMED"],
    [19,"#29","Test WalkIn Patient","+91 99999 11111","Follow-up: General Consultation","Nov 3, 2026 • 4:00 PM","Dr. Deep Arvindbhai Patel","CONFIRMED"],
    [20,"#40","Marcus Brody","+15555033437","Follow-up: General Consultation","Nov 3, 2026 • 4:00 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [21,"#47","Test Conflict Resolution","9876543210","Follow-up Consultation","Nov 3, 2026 • 4:00 PM","Dr. Deep Arvindbhai Patel","CONFIRMED"],
    [22,"#16","Speed Check After Optimization","9123456781","Root Canal Treatment (Endodontics)","Nov 1, 2026 • 1:00 PM","Dr. Deep Patel","CONFIRMED"],
    [23,"#13","Perf Test","9123456784","General Dental Consultation & Checkup","Nov 1, 2026 • 10:45 AM","Dr. Deep Patel","TREATMENT_DONE"],
    [24,"#1","Manli","9909221670","General Dental Consultation & Checkup","Oct 31, 2026 • 2:00 PM","Any Available Specialist","PENDING"],
    [25,"#58","yash patel","9664681536","General Consultation","Oct 30, 2026 • 4:30 PM","Dr. Sankar (Chief Dental Surgeon)","CHECKED_IN"],
    [26,"#58","yash patel","9664681536","General Dental Consultation & Checkup","Oct 30, 2026 • 3:30 PM","Any Available Specialist","CONFIRMED"],
    [27,"#58","yash patel","9664681536","General Consultation","Oct 30, 2026 • 2:30 PM","Dr. Deep Patel","CONFIRMED"],
    [28,"#58","yash patel","9664681536","General Consultation","Oct 30, 2026 • 2:30 PM","Dr. Deep Patel","CONFIRMED"],
    [29,"#58","yash patel","9664681536","General Consultation","Oct 30, 2026 • 2:30 PM","Dr. Deep Patel","CONFIRMED"],
    [30,"#58","yash patel","9664681536","General Consultation","Oct 30, 2026 • 2:30 PM","Dr. Deep Patel","CONFIRMED"],
    [31,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 6:33 PM","Any Available Specialist","PENDING"],
    [32,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 6:28 PM","Any Available Specialist","PENDING"],
    [33,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 6:16 PM","Any Available Specialist","PENDING"],
    [34,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 6:13 PM","Any Available Specialist","PENDING"],
    [35,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 6:07 PM","Any Available Specialist","PENDING"],
    [36,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:55 PM","Any Available Specialist","PENDING"],
    [37,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:37 PM","Any Available Specialist","PENDING"],
    [38,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:22 PM","Any Available Specialist","PENDING"],
    [39,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:21 PM","Any Available Specialist","PENDING"],
    [40,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:19 PM","Any Available Specialist","PENDING"],
    [41,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:13 PM","Any Available Specialist","PENDING"],
    [42,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:04 PM","Any Available Specialist","PENDING"],
    [43,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 29, 2026 • 5:03 PM","Any Available Specialist","PENDING"],
    [44,"#58","yash patel","9664681536","Root Canal Treatment (Endodontics)","Oct 29, 2026 • 5:00 PM","Any Available Specialist","CANCELLED"],
    [45,"#3","anadi tajapar","9664681536","General Dental Consultation & Checkup","Oct 29, 2026 • 5:00 PM","Any Available Specialist","PENDING"],
    [46,"#50","anandi patel","9909221670","General Dental Consultation & Checkup","Oct 29, 2026 • 3:30 PM","Any Available Specialist","PENDING"],
    [47,"#16","Speed Check After Optimization","9123456781","General Dental Consultation & Checkup","Oct 29, 2026 • 9:30 AM","Dr. Deep Patel","PENDING"],
    [48,"#14","Speed Run Test","9123456783","General Dental Consultation & Checkup","Oct 29, 2026 • 9:30 AM","Dr. Deep Patel","CANCELLED"],
    [49,"#15","Speed Check After Fix","9123456782","General Dental Consultation & Checkup","Oct 29, 2026 • 9:30 AM","Dr. Deep Patel","CHECKED_IN"],
    [50,"#17","Speed Check 2","9123456780","General Dental Consultation & Checkup","Oct 29, 2026 • 9:30 AM","Dr. Deep Patel","TREATMENT_DONE"],
    [51,"#47","Test Conflict Resolution","9876543210","General Dental Consultation & Checkup","Oct 28, 2026 • 10:00 PM","Dr. Sankar (Chief Dental Surgeon)","PENDING"],
    [52,"#57","Aarav Mehta","+91 98251 44210","Root Canal Treatment (Endodontics)","Oct 28, 2026 • 5:51 PM","Dr. Deep Patel","PENDING"],
    [53,"#19","Speed Test","9123456789","General Dental Consultation & Checkup","Oct 28, 2026 • 5:45 PM","Any Available Specialist","COMPLETED"],
    [54,"#21","Priya Sharma","9876501234","General Dental Consultation & Checkup","Oct 28, 2026 • 5:42 PM","Any Available Specialist","CONFIRMED"],
    [55,"#18","Bench Mark","9123456789","General Dental Consultation & Checkup","Oct 28, 2026 • 5:41 PM","Dr. Deep Patel","CONFIRMED"],
    [56,"#47","Test Conflict Resolution","9876543210","General Dental Consultation & Checkup","Oct 28, 2026 • 5:40 PM","Dr. Deep Patel","PENDING"],
    [57,"#51","Sneha Joshi","+91 97234 66102","General Dental Consultation & Checkup","Oct 28, 2026 • 4:20 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [58,"#54","Ananya Desai","+91 98980 55123","General Dental Consultation & Checkup","Oct 28, 2026 • 4:20 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [59,"#56","Priya Sharma","+91 97123 88412","General Consultation","Oct 28, 2026 • 4:20 PM","Dr. Rohan Shah (Orthodontics)","CONFIRMED"],
    [60,"#53","Kavita Nair","+91 98240 77651","General Consultation","Oct 28, 2026 • 3:45 PM","Dr. Deep Arvindbhai Patel","PENDING"],
    [61,"#39","manali","9664681536","General Dental Consultation & Checkup","Oct 28, 2026 • 3:30 PM","Any Available Specialist","COMPLETED"],
    [62,"#56","Priya Sharma","+91 97123 88412","Composite Restoration (Class I/II)","Oct 28, 2026 • 2:00 PM","Dr. Deep Arvindbhai Patel","PENDING"],
    [63,"#56","Priya Sharma","+91 97123 88412","Composite Restoration (Class I/II)","Oct 28, 2026 • 2:00 PM","Dr. Deep Arvindbhai Patel","PENDING"],
    [64,"#56","Priya Sharma","+91 97123 88412","Composite Restoration (Class I/II)","Oct 28, 2026 • 2:00 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [65,"#56","Priya Sharma","+91 97123 88412","Composite Restoration (Class I/II)","Oct 28, 2026 • 2:00 PM","Dr. Deep Arvindbhai Patel","CONFIRMED"],
    [66,"#56","Priya Sharma","+91 97123 88412","Composite Restoration (Class I/II)","Oct 28, 2026 • 2:00 PM","Dr. Deep Arvindbhai Patel","COMPLETED"],
    [67,"#36","Website Contact Patient","9825100000","General Consultation","Oct 27, 2026 • 11:00 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [68,"#37","Amit Vora","0000000014","General Consultation","Oct 27, 2026 • 9:30 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [69,"#30","Priya Sharma","+91 98222 33344","Teeth Whitening & Bleaching","Oct 27, 2026 • 7:40 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [70,"#31","Real Patient Test","+91 97777 55555","Root Canal Treatment","Oct 27, 2026 • 6:39 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [71,"#52","Vikram Singhania","+91 94280 33219","General Consultation","Oct 27, 2026 • 4:20 PM","Dr. New Dental Specialist","TREATMENT_DONE"],
    [72,"#55","Rohan Patel","+91 99042 11985","General Consultation","Oct 27, 2026 • 4:20 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [73,"#38","Pooja Shah","+91 98765 43210","Teeth Whitening & Bleaching","Oct 27, 2026 • 4:00 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [74,"#58","yash patel","9664681536","General Consultation","Oct 27, 2026 • 3:45 PM","Dr. Sankar (Chief Dental Surgeon)","TREATMENT_DONE"],
    [75,"#32","Smooth Queue Patient","+91 98888 22222","General Consultation","Oct 27, 2026 • 3:30 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [76,"#33","Test WalkIn Patient","+91 99999 11111","General Consultation","Oct 27, 2026 • 3:30 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [77,"#34","Karan Desai","9825100099","General Consultation","Oct 27, 2026 • 3:30 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [78,"#28","Priya Patel","+91 99988 77766","General Consultation","Oct 27, 2026 • 3:30 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [79,"#35","Test Walkin","9898012345","General Consultation","Oct 27, 2026 • 3:30 PM","Dr. Deep Arvindbhai Patel","TREATMENT_DONE"],
    [80,"#57","Aarav Mehta","+91 98251 44210","General Consultation","Oct 26, 2026 • 4:20 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [81,"#58","yash patel","9664681536","General Dental Consultation & Checkup","Oct 26, 2026 • 3:30 PM","Any Available Specialist","CONFIRMED"],
    [82,"#53","Kavita Nair","+91 98240 77651","General Dental Consultation & Checkup","Oct 25, 2026 • 4:20 PM","Dr. Sankar (Chief Dental Surgeon)","COMPLETED"],
    [83,"#58","yash patel","9664681536","Orthodontics & Invisible Braces","Oct 25, 2026 • 3:30 PM","Any Available Specialist","PENDING"],
    [84,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 25, 2026 • 11:30 AM","Any Available Specialist","CONFIRMED"],
    [85,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 25, 2026 • 10:29 AM","Any Available Specialist","CONFIRMED"],
    [86,"#43","Arthur Dent","+15554321098","General Patient Inquiry","Oct 25, 2026 • 10:06 AM","Any Available Specialist","CONFIRMED"],
    [87,"#44","Fourth Patient 03:30 PM","9876543213","General Dental Consultation & Checkup","Oct 24, 2026 • 9:00 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [88,"#47","Test Conflict Resolution","9876543210","General Dental Consultation & Checkup","Oct 24, 2026 • 9:00 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [89,"#45","Third Patient 03:30 PM","9876543212","General Dental Consultation & Checkup","Oct 24, 2026 • 9:00 PM","Dr. New Dental Specialist (Dental Surgeon)","PENDING"],
    [90,"#46","Second Patient 03:30 PM","9876543211","General Dental Consultation & Checkup","Oct 24, 2026 • 9:00 PM","Dr. Rohan Shah (Orthodontics)","PENDING"],
    [91,"#54","Ananya Desai","+91 98980 55123","General Consultation","Oct 23, 2026 • 9:30 PM","Dr. Sankar (Chief Dental Surgeon)","CONFIRMED"],
    [92,"#55","Rohan Patel","+91 99042 11985","Teeth Cleaning & Scaling (Prophylaxis)","Oct 23, 2026 • 7:30 PM","Dr. Marcus Vance (Orthodontist & Implantologist)","CHECKED_IN"],
    [93,"#56","Priya Sharma","+91 97123 88412","Orthodontics & Invisible Braces","Oct 23, 2026 • 4:30 PM","Dr. Sarah Chen (Pediatric Dentist)","CONFIRMED"],
    [94,"#50","anandi patel","9909221670","Periodontal Gum Treatment & Scaling","Oct 23, 2026 • 4:00 PM","Dr. Sankar (Chief Dental Surgeon)","COMPLETED"],
    [95,"#57","Aarav Mehta","+91 98251 44210","Root Canal Treatment (Endodontics)","Oct 23, 2026 • 3:45 PM","Dr. Marcus Vance (Orthodontist & Implantologist)","CONFIRMED"],
    [96,"#48","anandi 5","9664681536","General Dental Consultation & Checkup","Oct 23, 2026 • 3:30 PM","Any Available Specialist","NO_SHOW"],
    [97,"#49","Sneha Vora","+91 98980 99887","General Consultation","Oct 23, 2026 • 3:30 PM","Dr. Sarah Chen (Pediatric Dentist)","COMPLETED"]
  ];
  writeRawDataToSheet(ss, "Bookings", bookings);

  // 3. Feedback Data
  var feedback = [
    ["#", "Feedback ID", "Patient / Author", "Rating", "Review", "Treatment", "Source", "Date", "Status"],
    [1,"REV-G0611014","Ananya Deshmukh","5 ★","Best dental clinic in the area. Friendly environment for kids, advanced tools, and very reasonable treatment plans without unnecessary procedures.","Pediatric Dental Checkup","GOOGLE","Just now (Synced)","APPROVED"],
    [2,"REV-G0611017","Jonathan Miller","5 ★","Outstanding patient experience. The front desk was courteous, appointment was right on time, and Dr. Evelyn was remarkably thorough with my cardiac stress test explanation.","Cardiology Stress Test","GOOGLE","Just now (Synced)","APPROVED"],
    [3,"REV-G0611065","Kavita R. Nair","5 ★","Visited for severe toothache on a Sunday morning. The clinic was immaculate and the dentist solved the problem with precision and zero pain. Google reviews were 100% accurate!","Emergency Dental Care","GOOGLE","Just now (Synced)","APPROVED"],
    [4,"REV-101","Margaret Sullivan","5 ★","The doctors here caught an arrhythmia that three other clinics brushed off as anxiety. The state-of-the-art diagnostics and warm staff made all the difference. I've never felt so thoroughly cared for.","Cardiovascular Screen & ECG","GOOGLE","2 days ago","APPROVED"],
    [5,"REV-102","David K. Thornton","5 ★","Brought my 4-year-old in for sudden ear pain. We were seen in under 15 minutes, and the pediatrician was exceptionally gentle. The WhatsApp booking and instant follow-up was top tier.","Pediatric Emergency Triage","GOOGLE","1 week ago","APPROVED"],
    [6,"REV-103","Priya N. Ramaswamy","5 ★","Exceptional dental hygiene and laser whitening treatment. Dr. Sankar took the time to explain the entire procedure and there was zero discomfort. The clinic cleanliness is spotless!","Dental Scaling & Aesthetics","GOOGLE","2 weeks ago","APPROVED"],
    [7,"REV-104","Arthur B. Chen","5 ★","Transparent communication and pristine modern facilities. Booking directly through their online portal was seamless, and the doctor was attentive to every detail of my metabolic test results.","Comprehensive Health Checkup","WEBSITE","3 weeks ago","APPROVED"],
    [8,"REV-105","Samantha Jenkins","4 ★","Very competent clinical staff and modern diagnostic equipment. Waited about 10 minutes past my appointment time, but the doctor spent plenty of time answering all my questions.","Cardiology Consultation","GOOGLE","Yesterday","APPROVED"],
    [9,"REV-106","Robert Martinez","5 ★","Had a root canal done here and couldn't believe how painless it was. Staff followed up the next day via WhatsApp to check how I was feeling. 10/10 service!","Root Canal Treatment","WEBSITE","3 days ago","APPROVED"]
  ];
  writeRawDataToSheet(ss, "Feedback", feedback);

  try {
    ss.toast("✅ Successfully populated " + (contacts.length - 1) + " Patients & " + (bookings.length - 1) + " Bookings!", "Clinic Live Sync", 6);
  } catch (e) {}

  return {
    success: true,
    message: "Populated " + (contacts.length - 1) + " Patients and " + (bookings.length - 1) + " Bookings directly into Google Sheets!"
  };
}

/**
 * 2. Adds "🏥 Clinic Live Sync" menu in Google Sheets
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("🏥 Clinic Live Sync")
      .addItem("⚡ Populate / Refresh Sheet Now", "populateSheetNow")
      .addToUi();
  } catch (e) {}
}

/**
 * Helper to write 2D array data to sheet tab with green header styling
 */
function writeRawDataToSheet(ss, sheetName, data) {
  if (!data || data.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    var defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && defaultSheet.getLastRow() === 0 && sheetName === "Contacts") {
      defaultSheet.setName("Contacts");
      sheet = defaultSheet;
    } else {
      sheet = ss.insertSheet(sheetName);
    }
  }

  sheet.clear();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  // Style Header Row (Dark green background, white bold text)
  var header = sheet.getRange(1, 1, 1, data[0].length);
  header.setBackground("#0F9D58");
  header.setFontColor("#FFFFFF");
  header.setFontWeight("bold");
  header.setHorizontalAlignment("center");
  header.setVerticalAlignment("middle");
  sheet.setFrozenRows(1);

  // Auto-resize columns
  try {
    for (var col = 1; col <= data[0].length; col++) {
      sheet.autoResizeColumn(col);
    }
  } catch (e) {}
}

/**
 * Converts array of JSON objects to 2D array and writes to sheet
 */
function writeArrayToSheet(ss, sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var headerMap = {
    rowNumber: "#",
    patientNumber: "Patient No.",
    patientNo: "Patient No.",
    fullName: "Full Name",
    patientName: "Full Name",
    whatsappPhone: "WhatsApp Phone",
    phone: "WhatsApp Phone",
    email: "Email",
    visits: "Visits",
    service: "Service",
    dateTime: "Date & Slot",
    doctor: "Doctor",
    status: "Status",
    feedbackId: "Feedback ID",
    authorName: "Patient / Author",
    rating: "Rating",
    comment: "Review",
    treatment: "Treatment",
    source: "Source",
    date: "Date"
  };
  var rawKeys = Object.keys(rows[0]);
  var displayHeaders = rawKeys.map(function(k) { return headerMap[k] || k; });
  var data = [displayHeaders];
  for (var i = 0; i < rows.length; i++) {
    var row = [];
    for (var j = 0; j < rawKeys.length; j++) {
      row.push(rows[i][rawKeys[j]] != null ? rows[i][rawKeys[j]] : "");
    }
    data.push(row);
  }
  writeRawDataToSheet(ss, sheetName, data);
}

/**
 * Helper to get the target spreadsheet
 */
function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  try {
    if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {}
  return null;
}

/**
 * 3. Handles Web App GET requests
 */
function doGet(e) {
  try {
    if (e && e.parameter && (e.parameter.sync === "1" || e.parameter.action === "SYNC_ALL")) {
      var result = populateSheetNow();
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: "ACTIVE",
      success: true,
      service: "SmileCraft Live Scanner",
      spreadsheetId: SPREADSHEET_ID
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 4. Handles Web App POST requests (from Admin Panel 'Sync Now' or new booking hooks)
 */
function doPost(e) {
  try {
    var contents = null;
    if (e && e.postData && e.postData.contents) {
      try { contents = JSON.parse(e.postData.contents); } catch (pe) {}
    }

    if (contents && (contents.action === "PING" || contents.ping)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: "ACTIVE",
        message: "Google Apps Script Webhook is active and responding"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (contents && contents.sheets) {
      var ss = getSpreadsheet();
      if (ss) {
        if (contents.sheets.Contacts) writeArrayToSheet(ss, "Contacts", contents.sheets.Contacts);
        if (contents.sheets.Bookings) writeArrayToSheet(ss, "Bookings", contents.sheets.Bookings);
        if (contents.sheets.Feedback) writeArrayToSheet(ss, "Feedback", contents.sheets.Feedback);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Synchronized directly via Webhook payload!"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var result = populateSheetNow();
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
