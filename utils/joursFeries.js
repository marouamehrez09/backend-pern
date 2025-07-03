// calcule la date de Pâques pour une année donnée (algorithme de Butcher)
function getEasterDate(year) {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(H / 28) * f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  return new Date(year, month - 1, day);
}

// ajoute un nombre de jours à une date (sans modifier l'originale)
function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// formate une date en "YYYY-MM-DD"
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// calcule tous les jours fériés pour une année donnée
function getJoursFeries(year) {
  const easter = getEasterDate(year);

  const fixed = [
    `${year}-01-01`,  // Jour de l’An
    `${year}-05-01`,  // Fête du Travail
    `${year}-05-08`,  // Victoire 1945
    `${year}-07-14`,  // Fête nationale
    `${year}-08-15`,  // Assomption
    `${year}-11-01`,  // Toussaint
    `${year}-11-11`,  // Armistice 1918
    `${year}-12-25`,  // Noël
  ];

  const mobile = [
    formatDate(addDays(easter, 1)),   // Lundi de Pâques (+1 jour)
    formatDate(addDays(easter, 39)),  // Ascension (+39 jours)
    formatDate(addDays(easter, 50)),  // Lundi de Pentecôte (+50 jours)
  ];

  return [...fixed, ...mobile];
}

// calcule tous les jours fériés entre deux dates (pour gérer plusieurs années)
function getJoursFeriesBetween(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  const joursFeries = [];

  for (let year = startYear; year <= endYear; year++) {
    joursFeries.push(...getJoursFeries(year));
  }

  return joursFeries;
}

module.exports = {
  getJoursFeries,
  getJoursFeriesBetween,
};
