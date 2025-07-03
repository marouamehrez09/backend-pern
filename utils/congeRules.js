module.exports = {
    typesConge: [
      "annuel",
      "maladie",
      "maternité",
      "paternité",
      "événements familiaux",
      "sans solde",
      "formation professionnelle",
      "convenance personnelle",
      "exceptionnel",
    ],
  
    rules: {
      annuel: {
        label: "Congé payé annuel",
        besoinSolde: true,
        joursMax: 30,
        checkDates: true,
        exclureJoursFeries: true,
        exclureWeekends: true,
        //justification: false,
      },
  
      maladie: {
        label: "Congé maladie",
        besoinSolde: false,
        checkDates: true,
        justification: true,
        exclureJoursFeries: false,
      },
  
      maternité: {
        label: "Congé maternité",
        besoinSolde: false,
        joursFixes: 112, // 16 semaines
        checkImmediate: true,
        exclureJoursFeries: false,
      },
  
      paternité: {
        label: "Congé paternité",
        besoinSolde: false,
        joursMax: 25,
        checkImmediate: true,
        exclureJoursFeries: false,
      },
  
      "événements familiaux": {
        label: "Événements familiaux",
        besoinSolde: false,
        joursMax: 5,
        checkDates: true,
        //justification: true,
      },
  
      "sans solde": {
        label: "Congé sans solde",
        besoinSolde: false,
        checkDates: true,
      },
  
      "formation professionnelle": {
        label: "Formation professionnelle",
        besoinSolde: false,
        checkDates: true,
      },
  
      "convenance personnelle": {
        label: "Convenance personnelle",
        besoinSolde: false,
        checkDates: true,
      },
  
      exceptionnel: {
        label: "Congé exceptionnel",
        besoinSolde: false,
        checkDates: true,
      },
    },
  };
  