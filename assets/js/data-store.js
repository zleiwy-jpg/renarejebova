(function (global) {
  "use strict";

  const DB_KEY = "rena.admin.db.v1";
  const SESSION_KEY = "rena.admin.session.v1";
  const listeners = new Set();

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function hashPassword(value) {
    const text = `rena::${String(value)}`;
    let first = 0x811c9dc5;
    let second = 0x1000193;
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      first ^= code;
      first = Math.imul(first, 0x01000193) >>> 0;
      second = Math.imul(second ^ code, 0x85ebca6b) >>> 0;
    }
    return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
  }

  function isoDaysAgo(days, hour, minute) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  const studentSeed = [
    { name: "Aysel Məmmədova", grade: "11-A", phone: "050 214 55 18", answers: 1284, rating: 98 },
    { name: "Murad Əliyev", grade: "11-B", phone: "055 318 42 07", answers: 1197, rating: 95 },
    { name: "Nərmin Həsənova", grade: "10-A", phone: "070 612 88 34", answers: 1103, rating: 92 },
    { name: "Tural Quliyev", grade: "11-C", phone: "051 447 90 12", answers: 986, rating: 89 },
    { name: "Leyla İsmayılova", grade: "10-B", phone: "050 701 26 43", answers: 924, rating: 86 },
    { name: "Rəvan Babayev", grade: "9-A", phone: "077 520 14 68", answers: 861, rating: 82 },
    { name: "Zəhra Abdullayeva", grade: "10-C", phone: "055 890 33 21", answers: 790, rating: 78 },
    { name: "Elvin Rzayev", grade: "11-A", phone: "050 366 77 90", answers: 742, rating: 74 },
    { name: "Aytac Cəfərova", grade: "9-B", phone: "051 623 18 05", answers: 688, rating: 70 },
    { name: "Kamran Nəsibov", grade: "12-A", phone: "070 415 62 39", answers: 615, rating: 66 },
    { name: "Səbinə Xəlilova", grade: "10-A", phone: "055 274 91 50", answers: 552, rating: 62 },
    { name: "Fərid Musayev", grade: "9-C", phone: "050 938 40 27", answers: 498, rating: 58 }
  ];

  const examSeed = [
    { name: "Aysel Məmmədova", level: "abituriyent", score: 95, days: 0, hour: 18, minute: 42, duration: 512, blank: 1 },
    { name: "Murad Əliyev", level: "abituriyent", score: 85, days: 0, hour: 17, minute: 10, duration: 603, blank: 0 },
    { name: "Nərmin Həsənova", level: "middle-school", score: 90, days: 0, hour: 16, minute: 5, duration: 480, blank: 2 },
    { name: "Tural Quliyev", level: "middle-school", score: 75, days: 1, hour: 19, minute: 20, duration: 702, blank: 0 },
    { name: "Leyla İsmayılova", level: "middle-school", score: 80, days: 1, hour: 15, minute: 30, duration: 655, blank: 1 },
    { name: "Rəvan Babayev", level: "middle-school", score: 70, days: 2, hour: 14, minute: 12, duration: 812, blank: 2 },
    { name: "Zəhra Abdullayeva", level: "middle-school", score: 65, days: 2, hour: 11, minute: 40, duration: 760, blank: 1 },
    { name: "Elvin Rzayev", level: "abituriyent", score: 60, days: 3, hour: 20, minute: 5, duration: 845, blank: 0 },
    { name: "Aytac Cəfərova", level: "middle-school", score: 55, days: 3, hour: 18, minute: 22, duration: 900, blank: 3 },
    { name: "Kamran Nəsibov", level: "abituriyent", score: 50, days: 4, hour: 17, minute: 48, duration: 780, blank: 0 },
    { name: "Səbinə Xəlilova", level: "middle-school", score: 45, days: 4, hour: 12, minute: 15, duration: 880, blank: 2 },
    { name: "Fərid Musayev", level: "middle-school", score: 40, days: 5, hour: 10, minute: 30, duration: 900, blank: 4 },
    { name: "Nihad Əliyev", level: "abituriyent", score: 85, days: 5, hour: 19, minute: 5, duration: 560, blank: 1, phone: "050 512 74 63" },
    { name: "Gülnar Rəhimova", level: "middle-school", score: 90, days: 6, hour: 16, minute: 40, duration: 505, blank: 1, phone: "055 647 20 18" },
    { name: "Orxan Hüseynov", level: "abituriyent", score: 65, days: 6, hour: 14, minute: 20, duration: 760, blank: 0, phone: "070 183 55 42" },
    { name: "Mədinə Kərimova", level: "middle-school", score: 75, days: 7, hour: 18, minute: 10, duration: 690, blank: 1, phone: "051 764 38 29" },
    { name: "Rəşad İbrahimov", level: "abituriyent", score: 55, days: 8, hour: 20, minute: 30, duration: 890, blank: 2, phone: "050 826 41 07" },
    { name: "Ayan Qasımova", level: "middle-school", score: 80, days: 9, hour: 15, minute: 55, duration: 610, blank: 0, phone: "077 345 92 16" },
    { name: "Turan Əhmədov", level: "abituriyent", score: 45, days: 10, hour: 17, minute: 25, duration: 900, blank: 3, phone: "055 902 66 51" },
    { name: "Nərgiz Sadıqova", level: "middle-school", score: 70, days: 11, hour: 13, minute: 45, duration: 740, blank: 1, phone: "050 471 29 83" }
  ];

  const entrySeed = [
    { name: "Aysel Məmmədova", username: "aysel.m", mode: "login", days: 0, hour: 18, minute: 30, status: "yeni" },
    { name: "Nihad Əliyev", username: "nihad.aliyev", mode: "register", days: 0, hour: 16, minute: 12, status: "yeni" },
    { name: "Gülnar Rəhimova", username: "gulnar.r", mode: "login", days: 1, hour: 19, minute: 5, status: "baxıldı" },
    { name: "Murad Əliyev", username: "murad.eli", mode: "login", days: 1, hour: 14, minute: 40, status: "baxıldı" },
    { name: "Orxan Hüseynov", username: "orxan.h", mode: "register", days: 2, hour: 11, minute: 20, status: "yeni" },
    { name: "Mədinə Kərimova", username: "medine.k", mode: "register", days: 3, hour: 20, minute: 15, status: "baxıldı" },
    { name: "Rəşad İbrahimov", username: "reshad.i", mode: "login", days: 4, hour: 18, minute: 0, status: "baxıldı" },
    { name: "Ayan Qasımova", username: "ayan.q", mode: "register", days: 5, hour: 12, minute: 35, status: "yeni" }
  ];

  function createSeed() {
    const students = studentSeed.map((student, index) => ({
      id: `std_${index + 1}`,
      name: student.name,
      grade: student.grade,
      phone: student.phone,
      answers: student.answers,
      rating: student.rating,
      status: "active",
      createdAt: isoDaysAgo(70 - index * 4, 10, 15)
    }));

    const exams = examSeed.map((exam, index) => {
      const correct = Math.round(exam.score / 5);
      const blank = exam.blank;
      const student = students.find(item => normalizeName(item.name) === normalizeName(exam.name));
      return {
        id: `exam_${index + 1}`,
        studentId: student ? student.id : null,
        name: exam.name,
        phone: exam.phone || (student ? student.phone : "050 000 00 00"),
        level: exam.level,
        score: exam.score,
        correct,
        wrong: Math.max(0, 20 - correct - blank),
        blank,
        total: 20,
        durationSeconds: exam.duration,
        date: isoDaysAgo(exam.days, exam.hour, exam.minute),
        expired: false
      };
    });

    const entries = entrySeed.map((entry, index) => ({
      id: `entry_${index + 1}`,
      name: entry.name,
      username: entry.username,
      mode: entry.mode,
      date: isoDaysAgo(entry.days, entry.hour, entry.minute),
      status: entry.status
    }));

    return {
      version: 1,
      auth: {
        username: "admin",
        passwordHash: hashPassword("rena2026")
      },
      settings: {
        siteName: "Rəna Rəcəbova.az",
        rankingTitle: "Həftənin liderləri",
        rankingNote: "Ən çox suala cavab verən şagirdlər",
        rankingVisible: true,
        passScore: 50
      },
      students,
      exams,
      entries
    };
  }

  function normalizeDatabase(value) {
    const seed = createSeed();
    if (!value || typeof value !== "object" || Array.isArray(value)) return seed;

    const database = {
      version: 1,
      auth: {
        username: typeof value.auth?.username === "string" && value.auth.username.trim()
          ? value.auth.username.trim()
          : seed.auth.username,
        passwordHash: typeof value.auth?.passwordHash === "string" && value.auth.passwordHash
          ? value.auth.passwordHash
          : seed.auth.passwordHash
      },
      settings: {
        siteName: typeof value.settings?.siteName === "string" && value.settings.siteName.trim()
          ? value.settings.siteName.trim()
          : seed.settings.siteName,
        rankingTitle: typeof value.settings?.rankingTitle === "string" && value.settings.rankingTitle.trim()
          ? value.settings.rankingTitle.trim()
          : seed.settings.rankingTitle,
        rankingNote: typeof value.settings?.rankingNote === "string" && value.settings.rankingNote.trim()
          ? value.settings.rankingNote.trim()
          : seed.settings.rankingNote,
        rankingVisible: value.settings?.rankingVisible !== false,
        passScore: Number.isFinite(Number(value.settings?.passScore))
          ? Math.min(100, Math.max(0, Math.round(Number(value.settings.passScore))))
          : seed.settings.passScore
      },
      students: Array.isArray(value.students) ? value.students : seed.students,
      exams: Array.isArray(value.exams) ? value.exams : seed.exams,
      entries: Array.isArray(value.entries) ? value.entries : seed.entries
    };

    database.students = database.students.filter(student => student && typeof student === "object").map((student, index) => ({
      id: typeof student.id === "string" && student.id ? student.id : uid(`std_${index}`),
      name: String(student.name || "").trim() || "Adsız şagird",
      grade: String(student.grade || "").trim(),
      phone: String(student.phone || "").trim(),
      answers: Math.max(0, Math.round(Number(student.answers) || 0)),
      rating: Math.min(100, Math.max(0, Math.round(Number(student.rating) || 0))),
      status: student.status === "inactive" ? "inactive" : "active",
      createdAt: typeof student.createdAt === "string" ? student.createdAt : new Date().toISOString()
    }));

    database.exams = database.exams.filter(exam => exam && typeof exam === "object").map((exam, index) => ({
      id: typeof exam.id === "string" && exam.id ? exam.id : uid(`exam_${index}`),
      studentId: typeof exam.studentId === "string" ? exam.studentId : null,
      name: String(exam.name || "").trim() || "Adsız",
      phone: String(exam.phone || "").trim(),
      level: exam.level === "abituriyent" ? "abituriyent" : "middle-school",
      score: Math.min(100, Math.max(0, Math.round(Number(exam.score) || 0))),
      correct: Math.max(0, Math.round(Number(exam.correct) || 0)),
      wrong: Math.max(0, Math.round(Number(exam.wrong) || 0)),
      blank: Math.max(0, Math.round(Number(exam.blank) || 0)),
      total: Math.max(1, Math.round(Number(exam.total) || 20)),
      durationSeconds: Math.max(0, Math.round(Number(exam.durationSeconds) || 0)),
      date: typeof exam.date === "string" ? exam.date : new Date().toISOString(),
      expired: Boolean(exam.expired)
    }));

    database.entries = database.entries.filter(entry => entry && typeof entry === "object").map((entry, index) => ({
      id: typeof entry.id === "string" && entry.id ? entry.id : uid(`entry_${index}`),
      name: String(entry.name || "").trim() || "Adsız",
      username: String(entry.username || "").trim(),
      mode: entry.mode === "register" ? "register" : "login",
      date: typeof entry.date === "string" ? entry.date : new Date().toISOString(),
      status: entry.status === "baxıldı" ? "baxıldı" : "yeni"
    }));

    return database;
  }

  function read() {
    try {
      const raw = global.localStorage.getItem(DB_KEY);
      if (!raw) {
        const seed = createSeed();
        global.localStorage.setItem(DB_KEY, JSON.stringify(seed));
        return seed;
      }
      return normalizeDatabase(JSON.parse(raw));
    } catch (error) {
      return createSeed();
    }
  }

  function emit() {
    const snapshot = read();
    listeners.forEach(listener => {
      try {
        listener(snapshot);
      } catch (error) {}
    });
  }

  function write(database) {
    global.localStorage.setItem(DB_KEY, JSON.stringify(database));
    emit();
    return database;
  }

  function update(mutator) {
    const database = read();
    mutator(database);
    return write(database);
  }

  function sortByDate(items) {
    return [...items].sort((first, second) => new Date(second.date) - new Date(first.date));
  }

  function getRanking() {
    const database = read();
    return database.students
      .filter(student => student.status === "active")
      .sort((first, second) => second.answers - first.answers || second.rating - first.rating)
      .map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        answers: student.answers,
        rating: student.rating
      }));
  }

  function saveStudent(payload) {
    return update(database => {
      const name = String(payload.name || "").trim().replace(/\s+/g, " ");
      const student = {
        id: payload.id || uid("std"),
        name,
        grade: String(payload.grade || "").trim(),
        phone: String(payload.phone || "").trim(),
        answers: Math.max(0, Math.round(Number(payload.answers) || 0)),
        rating: Math.min(100, Math.max(0, Math.round(Number(payload.rating) || 0))),
        status: payload.status === "inactive" ? "inactive" : "active",
        createdAt: payload.createdAt || new Date().toISOString()
      };
      const index = database.students.findIndex(item => item.id === student.id);
      if (index === -1) database.students.unshift(student);
      else database.students[index] = student;
      return student;
    });
  }

  function deleteStudent(id) {
    return update(database => {
      database.students = database.students.filter(student => student.id !== id);
      database.exams = database.exams.map(exam => exam.studentId === id ? { ...exam, studentId: null } : exam);
    });
  }

  function addExam(payload) {
    return update(database => {
      const name = String(payload.name || "").trim().replace(/\s+/g, " ");
      const student = database.students.find(item => normalizeName(item.name) === normalizeName(name));
      const total = Math.max(1, Math.round(Number(payload.total) || 20));
      const exam = {
        id: uid("exam"),
        studentId: student ? student.id : null,
        name: name || "Adsız",
        phone: String(payload.phone || "").trim(),
        level: payload.level === "abituriyent" ? "abituriyent" : "middle-school",
        score: Math.min(100, Math.max(0, Math.round(Number(payload.score) || 0))),
        correct: Math.max(0, Math.round(Number(payload.correct) || 0)),
        wrong: Math.max(0, Math.round(Number(payload.wrong) || 0)),
        blank: Math.max(0, Math.round(Number(payload.blank) || 0)),
        total,
        durationSeconds: Math.max(0, Math.round(Number(payload.durationSeconds) || 0)),
        date: new Date().toISOString(),
        expired: Boolean(payload.expired)
      };
      database.exams.unshift(exam);
      database.exams = database.exams.slice(0, 600);
      return exam;
    });
  }

  function deleteExam(id) {
    return update(database => {
      database.exams = database.exams.filter(exam => exam.id !== id);
    });
  }

  function clearExams() {
    return update(database => {
      database.exams = [];
    });
  }

  function addEntry(payload) {
    return update(database => {
      const entry = {
        id: uid("entry"),
        name: String(payload.name || "").trim().replace(/\s+/g, " ") || "Adsız",
        username: String(payload.username || "").trim(),
        mode: payload.mode === "register" ? "register" : "login",
        date: new Date().toISOString(),
        status: "yeni"
      };
      database.entries.unshift(entry);
      database.entries = database.entries.slice(0, 400);
      return entry;
    });
  }

  function updateEntry(id, patch) {
    return update(database => {
      const entry = database.entries.find(item => item.id === id);
      if (entry) Object.assign(entry, patch);
      return entry;
    });
  }

  function deleteEntry(id) {
    return update(database => {
      database.entries = database.entries.filter(entry => entry.id !== id);
    });
  }

  function getSettings() {
    return read().settings;
  }

  function saveSettings(patch) {
    return update(database => {
      database.settings = { ...database.settings, ...patch };
      database.settings.passScore = Math.min(100, Math.max(0, Math.round(Number(database.settings.passScore) || 0)));
      return database.settings;
    });
  }

  function verifyPassword(password) {
    return read().auth.passwordHash === hashPassword(password);
  }

  function setPassword(password) {
    return update(database => {
      database.auth.passwordHash = hashPassword(password);
    });
  }

  function replaceDatabase(value) {
    return write(normalizeDatabase(value));
  }

  function reset() {
    return write(createSeed());
  }

  global.RenaData = {
    DB_KEY,
    SESSION_KEY,
    hashPassword,
    getDb: read,
    saveDb: write,
    replaceDatabase,
    reset,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getStudents() {
      return [...read().students];
    },
    saveStudent,
    deleteStudent,
    getExams() {
      return sortByDate(read().exams);
    },
    addExam,
    deleteExam,
    clearExams,
    getEntries() {
      return sortByDate(read().entries);
    },
    addEntry,
    updateEntry,
    deleteEntry,
    getSettings,
    saveSettings,
    getRanking,
    verifyPassword,
    setPassword
  };
})(window);
