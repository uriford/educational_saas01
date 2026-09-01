export const dictionaries = {
  en: {
    common: {
      home: "Home",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      update: "Update",
      search: "Search",
      loading: "Loading...",
      yes: "Yes",
      no: "No",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      mainMenu: "Main Menu",
      educationPlatform: "Education Platform",
      signOut: "Sign out",
      logOut: "Log out",
      profileMenu: "Profile menu",
      closeProfileMenu: "Close profile menu",
      notifications: "Notifications",
      openNavigation: "Open navigation",
      system: "System",
      today: "Today",
      branch: "Branch",
      currentBranch: "Current Branch",
      accountSecurity: "Account & Security",
      organization: "Organization",
    },

    navigation: {
      mainMenu: "Main Menu",
      educationPlatform: "Education Platform",
      signOut: "Sign out",
      dashboard: "Dashboard",
      students: "Students",
      teachers: "Teachers",
      courses: "Courses",
      announcements: "Announcements",
      analytics: "Analytics",
      settings: "Settings",
      communication: "Communication",
      schedule: "Schedule",
      attendance: "Attendance",
      assessments: "Assessments",
      payments: "Payments",
      reports: "Reports",
      profile: "Profile",
      messages: "Messages",
      chat: "Chat",
      results: "Results",
      progress: "Progress",
      organizations: "Organizations",
      platformAdmins: "Platform Admins",
      guardians: "Guardians",
      enrollmentRequests: "Enrollment Requests",
    },

    dashboard: {
      welcome: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        backMessage: "Welcome back. Here's what's happening at",
        today: "today.",
        newStudent: "New Student",
      },

      platformAdministration: "Platform Administration",
      platformDescription:
        "Organization-level dashboard analytics are available after entering an organization context.",

      totalStudents: "Total Students",
      studentsInOrganization: "Students in your organization",
      activeStudents: "active",

      teachers: "Teachers",
      teachersInOrganization: "Teachers in your organization",
      activeTeachers: "active",

      courses: "Courses",
      coursesInOrganization: "Courses in your organization",
      activeCourses: "active",

      announcements: "Announcements",
      announcementsInOrganization: "Announcements in your organization",
      publishedAnnouncements: "published",

      recentActivity: "Recent Activity",
      recentActivityDescription: "Latest actions across your organization",
      noRecentActivity: "No recent activity",
      noRecentActivityDescription:
        "Actions performed in your organization will appear here.",
      system: "System",

      goodMorning: "Good morning",
      goodAfternoon: "Good afternoon",
      goodEvening: "Good evening",
      welcomeBack: "Welcome back. Here's what's happening at",
      todayActivity: "today.",
      newStudent: "New Student",

      quickActions: "Quick Actions",
      quickActionsDescription: "Frequently used shortcuts",
      noQuickActions: "No quick actions",
      noQuickActionsDescription: "Available shortcuts will appear here.",

      upcomingClasses: "Upcoming Classes",
      upcomingClassesDescription: "Today's scheduled classes",
      noUpcomingClasses: "No upcoming classes",
      noUpcomingClassesDescription:
        "There are no upcoming classes scheduled for today.",
      ongoing: "Ongoing",
      scheduled: "Scheduled",

      recentAnnouncements: "Recent Announcements",
      recentAnnouncementsDescription: "Latest notices from management",
      noAnnouncements: "No announcements yet",
      noAnnouncementsDescription:
        "Announcements from management will appear here.",

      addStudent: "Add Student",
      addStudentDescription: "Register a new student",
      addTeacher: "Add Teacher",
      addTeacherDescription: "Create a teacher profile",
      announcement: "Announcement",
      announcementDescription: "Publish an announcement",
      scheduleClass: "Schedule Class",
      scheduleClassDescription: "Create a new class schedule",

      actions: {
        addStudent: "Add Student",
        addTeacher: "Add Teacher",
        announcement: "Announcement",
        scheduleClass: "Schedule Class",
      },

      descriptions: {
        addStudent: "Register a new student",
        addTeacher: "Create a teacher profile",
        announcement: "Publish an announcement",
        scheduleClass: "Create a new class schedule",
      },

      activity: {
        student: "Student",
        teacher: "Teacher",
        course: "Course",
        class: "Class",
        announcement: "Announcement",
        user: "User",
      },

      coursesPage: {
        academicManagement: "Academic Management",
        title: "Courses",
        description:
          "Create, organize, and manage the academic programs offered by your organization.",
        createCourse: "Create Course",
        totalCourses: "Total Courses",
        coursesInBranch: "Courses in this branch",
        active: "Active",
        currentlyAvailable: "Currently available",
        inactive: "Inactive",
        notCurrentlyActive: "Not currently active",
        archived: "Archived",
        archivedPrograms: "Archived programs",
        allCourses: "All Courses",
        manageCoursesDescription:
          "Manage your organization's courses and academic programs.",
        displayed: "displayed",
        notScheduled: "Not scheduled",
        free: "Free",
        days: "days",
        seats: "seats",
        flexible: "Flexible",
        unlimited: "Unlimited",
        viewCourse: "View Course",
        edit: "Edit",
        noDescription: "No description has been added yet.",
        noCourses: "No courses yet",
        noCoursesDescription:
          "Your organization has not created any courses yet. Create your first course to start managing lessons, classes, assessments, and students.",
        createFirstCourse: "Create Your First Course",
      },

      studentsPage: {
        title: "Students",
        description: "Manage students and their enrollment information.",
        addStudent: "Add Student",
      },
    },

    settings: {
      preferences: "Preferences",
      description:
        "Configure the regional settings and features used by your organization.",
      timezone: "Timezone",
      timezoneExample: "Example: Asia/Dhaka",
      language: "Language",
      languageDescription: "Select the default language for your organization.",
      english: "English",
      bangla: "বাংলা",
      currency: "Currency",
      currencyExample: "Example: BDT",
      attendance: "Attendance",
      attendanceDescription:
        "Enable attendance tracking for students and class sessions.",
      attendanceEnabled: "Attendance tracking is enabled.",
      attendanceDisabled: "Attendance tracking is disabled.",
      savePreferences: "Save Preferences",
    },

    student: {
      overview: "Overview",
      myCourses: "My Courses",
      exploreCourses: "Explore Courses",
      routine: "Routine",
      portal: "Student Portal",
      role: "Student",
      myProfile: "My Profile",
      profileSettings: "Profile Settings",
      progress: "Progress",

      welcomeBack: "Welcome back",
      welcomeDescription:
        "Stay on top of your courses, schedule, announcements, and academic journey from one place.",
      viewMyProfile: "View my profile",

      coursesTitle: "My Courses",
      coursesDescription: "View your enrolled courses and learning progress.",
      noCourses: "No courses yet",
      noCoursesDescription:
        "You are not enrolled in any courses yet. Your courses will appear here once you are enrolled.",
      noDescription: "No description has been added for this course.",
      noDuration: "No duration",
      notScheduled: "Not scheduled",
      free: "Free",
      days: "days",
      enrolled: "Enrolled",
      enrolledOn: "Enrolled on",
      viewCourse: "View course",

      overviewTitle: "Your Overview",
      overviewDescription: "A quick look at your academic activity.",
      currentlyEnrolled: "Currently enrolled",
      attendance: "Attendance",
      attendanceOverview: "Attendance overview",
      upcomingClasses: "Upcoming Classes",
      classesScheduled: "Classes scheduled",
      learningHours: "Learning Hours",
      thisMonth: "This month",

      academicStatus: "Academic Status",
      studentId: "Student ID",
      status: "Status",
      admissionDate: "Admission Date",

      nextScheduledSessions: "Your next scheduled sessions.",
      viewSchedule: "View schedule",
      noUpcomingClasses: "No upcoming classes",
      scheduledClassesAppear: "Your scheduled classes will appear here.",

      paymentDue: "Payment Due",
      outstandingPaymentBalance: "Your outstanding payment balance.",
      viewInstallments: "View installments, due dates, and receipts.",
      viewPayments: "View Payments",

      enrollmentRequests: "Enrollment Requests",
      trackCourseApplications: "Track your course applications.",
      noEnrollmentRequests: "No enrollment requests.",
      submitted: "Submitted",

      courseDetail: "Course Details",
      backToMyCourses: "Back to My Courses",

      courseProgress: "Course Progress",
      startDate: "Start Date",
      endDate: "End Date",
      duration: "Duration",
      notSpecified: "Not specified",

      upcomingClassesDescription:
        "Your next scheduled classes for this course.",
      noUpcomingClassesDescription:
        "There are no upcoming classes scheduled right now.",
      upcoming: "Upcoming",
      teacher: "Teacher",

      inProgress: "In Progress",
      inProgressDescription: "Classes currently in session.",
      liveNow: "Live now",

      recentClasses: "Recent Classes",
      recentClassesDescription:
        "Recently finished classes for this course.",
      noRecentClasses: "No recent classes",
      finishedClassesAppear:
        "Finished classes will appear here.",
      completed: "Completed",

      yourProgress: "Your Progress",
      completedLabel: "completed",
      enrollmentStatus: "Enrollment status",
      completedOn: "Completed on",

      paymentStatus: "Payment Status",
      paymentSummary: "Your payment summary for this course.",
      courseFee: "Course Fee",
      paid: "Paid",
      remaining: "Remaining",

      courseLessons: "Course Lessons",
      courseLessonsDescription:
        "Work through the published lessons in order.",
      noLessonsAvailable: "No lessons available",
      publishedLessonsAppear:
        "Published lessons for this course will appear here.",
      continueLearning: "Continue",
      recentlyViewed: "Recently viewed",
      minutes: "min",

      assessments: "Assessments",
      assessmentsDescription:
        "Assessments currently available for this course.",
      noAssessmentsAvailable: "No assessments available",
      publishedAssessmentsAppear:
        "Published assessments for this course will appear here.",
      available: "Available",
      marks: "Marks",
      pass: "Pass",
      ends: "Ends",
      startAssessment: "Start Assessment",

      video: "Video",
      document: "Document",
      externalResource: "External Resource",
      reading: "Reading",
    },

    guardian: {
      myStudents: "My Students",
      portal: "Guardian Portal",
      role: "Guardian",
      welcome: "Welcome",
      access: "Guardian access",
      learningJourney: "Monitor your student's learning journey.",
    },

    messages: {
      unauthorized: "Unauthorized.",
      savedSuccessfully: "Preferences saved successfully.",
    },

    time: {
      justNow: "Just now",
      minuteAgo: "minute ago",
      minutesAgo: "minutes ago",
      hourAgo: "hour ago",
      hoursAgo: "hours ago",
      dayAgo: "day ago",
      daysAgo: "days ago",
    },
  },

  bn: {
    common: {
      home: "হোম",
      save: "সংরক্ষণ করুন",
      saving: "সংরক্ষণ করা হচ্ছে...",
      cancel: "বাতিল",
      edit: "সম্পাদনা",
      delete: "মুছুন",
      create: "তৈরি করুন",
      update: "আপডেট করুন",
      search: "অনুসন্ধান",
      loading: "লোড হচ্ছে...",
      yes: "হ্যাঁ",
      no: "না",
      close: "বন্ধ করুন",
      back: "পেছনে",
      next: "পরবর্তী",
      previous: "পূর্ববর্তী",
      mainMenu: "প্রধান মেনু",
      educationPlatform: "শিক্ষা প্ল্যাটফর্ম",
      signOut: "সাইন আউট",
      logOut: "লগ আউট",
      profileMenu: "প্রোফাইল মেনু",
      closeProfileMenu: "প্রোফাইল মেনু বন্ধ করুন",
      notifications: "বিজ্ঞপ্তি",
      openNavigation: "নেভিগেশন খুলুন",
      system: "সিস্টেম",
      today: "আজ",
      branch: "শাখা",
      currentBranch: "বর্তমান শাখা",
      accountSecurity: "অ্যাকাউন্ট ও নিরাপত্তা",
      organization: "প্রতিষ্ঠান",
    },

    navigation: {
      mainMenu: "প্রধান মেনু",
      educationPlatform: "শিক্ষা প্ল্যাটফর্ম",
      signOut: "সাইন আউট",
      dashboard: "ড্যাশবোর্ড",
      students: "শিক্ষার্থীরা",
      teachers: "শিক্ষকরা",
      courses: "কোর্সসমূহ",
      announcements: "ঘোষণা",
      analytics: "বিশ্লেষণ",
      settings: "সেটিংস",
      communication: "যোগাযোগ",
      schedule: "সময়সূচি",
      attendance: "উপস্থিতি",
      assessments: "মূল্যায়ন",
      payments: "পেমেন্ট",
      reports: "রিপোর্ট",
      profile: "প্রোফাইল",
      messages: "বার্তা",
      chat: "চ্যাট",
      results: "ফলাফল",
      progress: "অগ্রগতি",
      organizations: "প্রতিষ্ঠানসমূহ",
      platformAdmins: "প্ল্যাটফর্ম অ্যাডমিন",
      guardians: "অভিভাবকগণ",
      enrollmentRequests: "ভর্তির অনুরোধ",
    },

    dashboard: {
      welcome: {
        morning: "শুভ সকাল",
        afternoon: "শুভ অপরাহ্ন",
        evening: "শুভ সন্ধ্যা",
        backMessage: "আবারও স্বাগতম। এখানে আপনার",
        today: "আজকের কার্যক্রম।",
        newStudent: "নতুন শিক্ষার্থী",
      },

      platformAdministration: "প্ল্যাটফর্ম প্রশাসন",
      platformDescription:
        "কোনো প্রতিষ্ঠানের প্রেক্ষাপটে প্রবেশ করার পর প্রতিষ্ঠানভিত্তিক ড্যাশবোর্ড বিশ্লেষণ পাওয়া যাবে।",

      totalStudents: "মোট শিক্ষার্থী",
      studentsInOrganization: "আপনার প্রতিষ্ঠানের শিক্ষার্থীরা",
      activeStudents: "সক্রিয়",

      teachers: "শিক্ষক",
      teachersInOrganization: "আপনার প্রতিষ্ঠানের শিক্ষকরা",
      activeTeachers: "সক্রিয়",

      courses: "কোর্সসমূহ",
      coursesInOrganization: "আপনার প্রতিষ্ঠানের কোর্সসমূহ",
      activeCourses: "সক্রিয়",

      announcements: "ঘোষণা",
      announcementsInOrganization: "আপনার প্রতিষ্ঠানের ঘোষণা",
      publishedAnnouncements: "প্রকাশিত",

      recentActivity: "সাম্প্রতিক কার্যক্রম",
      recentActivityDescription: "আপনার প্রতিষ্ঠানের সর্বশেষ কার্যক্রম",
      noRecentActivity: "কোনো সাম্প্রতিক কার্যক্রম নেই",
      noRecentActivityDescription:
        "আপনার প্রতিষ্ঠানে সম্পাদিত কার্যক্রম এখানে দেখা যাবে।",
      system: "সিস্টেম",

      quickActions: "দ্রুত কার্যক্রম",
      quickActionsDescription: "প্রায়শই ব্যবহৃত শর্টকাট",
      noQuickActions: "কোনো দ্রুত কার্যক্রম নেই",
      noQuickActionsDescription: "উপলব্ধ শর্টকাট এখানে দেখা যাবে।",

      upcomingClasses: "আসন্ন ক্লাস",
      upcomingClassesDescription: "আজকের নির্ধারিত ক্লাসসমূহ",
      noUpcomingClasses: "কোনো আসন্ন ক্লাস নেই",
      noUpcomingClassesDescription:
        "আজকের জন্য কোনো আসন্ন ক্লাস নির্ধারিত নেই।",
      ongoing: "চলমান",
      scheduled: "নির্ধারিত",

      recentAnnouncements: "সাম্প্রতিক ঘোষণা",
      recentAnnouncementsDescription: "ব্যবস্থাপনার সর্বশেষ নোটিশ",
      noAnnouncements: "এখনও কোনো ঘোষণা নেই",
      noAnnouncementsDescription: "ব্যবস্থাপনার ঘোষণা এখানে দেখা যাবে।",

      addStudent: "শিক্ষার্থী যোগ করুন",
      addStudentDescription: "নতুন শিক্ষার্থী নিবন্ধন করুন",
      addTeacher: "শিক্ষক যোগ করুন",
      addTeacherDescription: "শিক্ষকের প্রোফাইল তৈরি করুন",
      announcement: "ঘোষণা",
      announcementDescription: "একটি ঘোষণা প্রকাশ করুন",
      scheduleClass: "ক্লাস নির্ধারণ করুন",
      scheduleClassDescription: "নতুন ক্লাসের সময়সূচি তৈরি করুন",

      actions: {
        addStudent: "শিক্ষার্থী যোগ করুন",
        addTeacher: "শিক্ষক যোগ করুন",
        announcement: "ঘোষণা",
        scheduleClass: "ক্লাস নির্ধারণ করুন",
      },

      descriptions: {
        addStudent: "নতুন শিক্ষার্থী নিবন্ধন করুন",
        addTeacher: "শিক্ষকের প্রোফাইল তৈরি করুন",
        announcement: "একটি ঘোষণা প্রকাশ করুন",
        scheduleClass: "নতুন ক্লাসের সময়সূচি তৈরি করুন",
      },

      activity: {
        student: "শিক্ষার্থী",
        teacher: "শিক্ষক",
        course: "কোর্স",
        class: "ক্লাস",
        announcement: "ঘোষণা",
        user: "ব্যবহারকারী",
      },

      coursesPage: {
        academicManagement: "একাডেমিক ব্যবস্থাপনা",
        title: "কোর্সসমূহ",
        description:
          "আপনার প্রতিষ্ঠানের একাডেমিক প্রোগ্রামগুলো তৈরি, সংগঠিত ও পরিচালনা করুন।",
        createCourse: "কোর্স তৈরি করুন",
        totalCourses: "মোট কোর্স",
        coursesInBranch: "এই শাখার কোর্সসমূহ",
        active: "সক্রিয়",
        currentlyAvailable: "বর্তমানে উপলব্ধ",
        inactive: "নিষ্ক্রিয়",
        notCurrentlyActive: "বর্তমানে সক্রিয় নয়",
        archived: "আর্কাইভ করা",
        archivedPrograms: "আর্কাইভ করা প্রোগ্রাম",
        allCourses: "সব কোর্স",
        manageCoursesDescription:
          "আপনার প্রতিষ্ঠানের কোর্স ও একাডেমিক প্রোগ্রাম পরিচালনা করুন।",
        displayed: "দেখানো হয়েছে",
        notScheduled: "নির্ধারিত নয়",
        free: "বিনামূল্যে",
        days: "দিন",
        seats: "টি আসন",
        flexible: "নমনীয়",
        unlimited: "সীমাহীন",
        viewCourse: "কোর্স দেখুন",
        edit: "সম্পাদনা",
        noDescription: "এখনও কোনো বিবরণ যোগ করা হয়নি।",
        noCourses: "এখনও কোনো কোর্স নেই",
        noCoursesDescription:
          "আপনার প্রতিষ্ঠান এখনও কোনো কোর্স তৈরি করেনি। পাঠ, ক্লাস, মূল্যায়ন এবং শিক্ষার্থী পরিচালনা শুরু করতে আপনার প্রথম কোর্সটি তৈরি করুন।",
        createFirstCourse: "আপনার প্রথম কোর্স তৈরি করুন",
      },

      studentsPage: {
        title: "শিক্ষার্থীরা",
        description: "শিক্ষার্থী এবং তাদের ভর্তি সংক্রান্ত তথ্য পরিচালনা করুন।",
        addStudent: "শিক্ষার্থী যোগ করুন",
      },
    },

    settings: {
      preferences: "পছন্দসমূহ",
      description:
        "আপনার প্রতিষ্ঠানের আঞ্চলিক সেটিংস এবং সুবিধাসমূহ কনফিগার করুন।",
      timezone: "টাইমজোন",
      timezoneExample: "উদাহরণ: Asia/Dhaka",
      language: "ভাষা",
      languageDescription: "আপনার প্রতিষ্ঠানের ডিফল্ট ভাষা নির্বাচন করুন।",
      english: "English",
      bangla: "বাংলা",
      currency: "মুদ্রা",
      currencyExample: "উদাহরণ: BDT",
      attendance: "উপস্থিতি",
      attendanceDescription:
        "শিক্ষার্থী এবং ক্লাস সেশনের উপস্থিতি ট্র্যাকিং চালু করুন।",
      attendanceEnabled: "উপস্থিতি ট্র্যাকিং চালু আছে।",
      attendanceDisabled: "উপস্থিতি ট্র্যাকিং বন্ধ আছে।",
      savePreferences: "পছন্দসমূহ সংরক্ষণ করুন",
    },

    student: {
      overview: "ওভারভিউ",
      myCourses: "আমার কোর্সসমূহ",
      exploreCourses: "কোর্স অন্বেষণ",
      routine: "রুটিন",
      portal: "শিক্ষার্থী পোর্টাল",
      role: "শিক্ষার্থী",
      myProfile: "আমার প্রোফাইল",
      profileSettings: "প্রোফাইল সেটিংস",
      progress: "অগ্রগতি",

      welcomeBack: "আবার স্বাগতম",
      welcomeDescription:
        "এক জায়গা থেকেই আপনার কোর্স, সময়সূচি, ঘোষণা এবং একাডেমিক অগ্রগতি সম্পর্কে আপডেট থাকুন।",
      viewMyProfile: "আমার প্রোফাইল দেখুন",

      coursesTitle: "আমার কোর্সসমূহ",
      coursesDescription: "আপনার নিবন্ধিত কোর্স এবং শেখার অগ্রগতি দেখুন।",
      noCourses: "এখনও কোনো কোর্স নেই",
      noCoursesDescription:
        "আপনি এখনও কোনো কোর্সে নিবন্ধিত হননি। নিবন্ধিত হলে আপনার কোর্সগুলো এখানে দেখা যাবে।",
      noDescription: "এই কোর্সের জন্য কোনো বিবরণ যোগ করা হয়নি।",
      noDuration: "সময়কাল নির্ধারিত নেই",
      notScheduled: "নির্ধারিত নয়",
      free: "বিনামূল্যে",
      days: "দিন",
      enrolled: "নিবন্ধিত",
      enrolledOn: "নিবন্ধনের তারিখ",
      viewCourse: "কোর্স দেখুন",

      overviewTitle: "আপনার ওভারভিউ",
      overviewDescription: "আপনার একাডেমিক কার্যক্রমের একটি সংক্ষিপ্ত চিত্র।",
      currentlyEnrolled: "বর্তমানে নিবন্ধিত",
      attendance: "উপস্থিতি",
      attendanceOverview: "উপস্থিতির সারসংক্ষেপ",
      upcomingClasses: "আসন্ন ক্লাস",
      classesScheduled: "নির্ধারিত ক্লাস",
      learningHours: "শেখার সময়",
      thisMonth: "এই মাসে",

      academicStatus: "একাডেমিক অবস্থা",
      studentId: "শিক্ষার্থী আইডি",
      status: "অবস্থা",
      admissionDate: "ভর্তির তারিখ",

      nextScheduledSessions: "আপনার পরবর্তী নির্ধারিত সেশনসমূহ।",
      viewSchedule: "রুটিন দেখুন",
      noUpcomingClasses: "কোনো আসন্ন ক্লাস নেই",
      scheduledClassesAppear: "আপনার নির্ধারিত ক্লাস এখানে দেখা যাবে।",

      paymentDue: "বকেয়া পেমেন্ট",
      outstandingPaymentBalance: "আপনার বকেয়া পেমেন্টের পরিমাণ।",
      viewInstallments: "কিস্তি, নির্ধারিত তারিখ এবং রসিদ দেখুন।",
      viewPayments: "পেমেন্ট দেখুন",

      enrollmentRequests: "ভর্তির অনুরোধ",
      trackCourseApplications: "আপনার কোর্সের আবেদনগুলো ট্র্যাক করুন।",
      noEnrollmentRequests: "কোনো ভর্তির অনুরোধ নেই।",
      submitted: "জমা দেওয়া হয়েছে",

      courseDetail: "কোর্সের বিবরণ",
      backToMyCourses: "আমার কোর্সসমূহে ফিরে যান",

      courseProgress: "কোর্সের অগ্রগতি",
      startDate: "শুরুর তারিখ",
      endDate: "শেষ তারিখ",
      duration: "সময়কাল",
      notSpecified: "নির্ধারিত নয়",

      upcomingClassesDescription:
        "এই কোর্সের জন্য আপনার পরবর্তী নির্ধারিত ক্লাসসমূহ।",
      noUpcomingClassesDescription:
        "এই মুহূর্তে কোনো আসন্ন ক্লাস নির্ধারিত নেই।",
      upcoming: "আসন্ন",
      teacher: "শিক্ষক",

      inProgress: "চলমান",
      inProgressDescription: "বর্তমানে চলমান ক্লাসসমূহ।",
      liveNow: "এখন চলছে",

      recentClasses: "সাম্প্রতিক ক্লাস",
      recentClassesDescription:
        "এই কোর্সের সম্প্রতি শেষ হওয়া ক্লাসসমূহ।",
      noRecentClasses: "কোনো সাম্প্রতিক ক্লাস নেই",
      finishedClassesAppear:
        "শেষ হওয়া ক্লাসগুলো এখানে দেখা যাবে।",
      completed: "সম্পন্ন",

      yourProgress: "আপনার অগ্রগতি",
      completedLabel: "সম্পন্ন",
      enrollmentStatus: "নিবন্ধনের অবস্থা",
      completedOn: "সম্পন্ন হয়েছে",

      paymentStatus: "পেমেন্টের অবস্থা",
      paymentSummary: "এই কোর্সের জন্য আপনার পেমেন্টের সারসংক্ষেপ।",
      courseFee: "কোর্স ফি",
      paid: "পরিশোধিত",
      remaining: "বাকি",

      courseLessons: "কোর্সের পাঠসমূহ",
      courseLessonsDescription:
        "প্রকাশিত পাঠগুলো ক্রমানুসারে সম্পন্ন করুন।",
      noLessonsAvailable: "কোনো পাঠ উপলব্ধ নেই",
      publishedLessonsAppear:
        "এই কোর্সের প্রকাশিত পাঠগুলো এখানে দেখা যাবে।",
      continueLearning: "চালিয়ে যান",
      recentlyViewed: "সম্প্রতি দেখা হয়েছে",
      minutes: "মিনিট",

      assessments: "মূল্যায়নসমূহ",
      assessmentsDescription:
        "এই কোর্সের জন্য বর্তমানে উপলব্ধ মূল্যায়নসমূহ।",
      noAssessmentsAvailable: "কোনো মূল্যায়ন উপলব্ধ নেই",
      publishedAssessmentsAppear:
        "এই কোর্সের প্রকাশিত মূল্যায়নগুলো এখানে দেখা যাবে।",
      available: "উপলব্ধ",
      marks: "নম্বর",
      pass: "পাস নম্বর",
      ends: "শেষ হবে",
      startAssessment: "মূল্যায়ন শুরু করুন",

      video: "ভিডিও",
      document: "ডকুমেন্ট",
      externalResource: "বাহ্যিক রিসোর্স",
      reading: "পাঠ",
    },

    guardian: {
      myStudents: "আমার শিক্ষার্থীরা",
      portal: "অভিভাবক পোর্টাল",
      role: "অভিভাবক",
      welcome: "স্বাগতম",
      access: "অভিভাবক অ্যাক্সেস",
      learningJourney: "আপনার শিক্ষার্থীর শেখার অগ্রগতি পর্যবেক্ষণ করুন।",
    },

    messages: {
      unauthorized: "অননুমোদিত।",
      savedSuccessfully: "পছন্দসমূহ সফলভাবে সংরক্ষণ করা হয়েছে।",
    },

    time: {
      justNow: "এইমাত্র",
      minuteAgo: "মিনিট আগে",
      minutesAgo: "মিনিট আগে",
      hourAgo: "ঘণ্টা আগে",
      hoursAgo: "ঘণ্টা আগে",
      dayAgo: "দিন আগে",
      daysAgo: "দিন আগে",
    },
  },
} as const;

export type Language = keyof typeof dictionaries;

type Dictionary = (typeof dictionaries)[Language];

function getValue(dictionary: Dictionary, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, dictionary);

  return typeof value === "string" ? value : undefined;
}

export function translate(language: Language, key: string): string {
  return (
    getValue(dictionaries[language], key) ??
    getValue(dictionaries.en, key) ??
    key
  );
}
