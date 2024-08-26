const API_KEY = '755534b30d7b3b27c95da239'; // Replace with your real API key

let currentStep = 1;
let position = '';
let season = '';
const sectorFees = {
  firstOfficer: { S1: 1625, S2: 2640, S3: 3420, S4: 3775, Night: 4455 },
  captain: { S1: 3045, S2: 4975, S3: 6475, S4: 7090, Night: 8395 }
};
const baseSalaries = {
  F1: 90245, F2: 176975, F3: 192244, F4: 212063,
  C1: 261080, C2: 290123, C3: 307224, C4: 318632
};

const layoverRates = {
  international: 50, // 50 EUR/day
  domestic: 500, // 500 TRY/day
  ercan: 500 // 500 TRY/day
};

async function fetchExchangeRates() {
  const api### Updated `script.js` (continued)

```js
  const apiUrl = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`;

  try {
    // Try to fetch live exchange rates from the API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Return the fetched exchange rates
    return {
      usd: data.conversion_rates.USD,
      eur: data.conversion_rates.EUR
    };
  } catch (error) {
    console.log('Network error, trying cached data...');

    // If the fetch fails, try to use cached data
    const cachedResponse = await caches.match(apiUrl);

    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      return {
        usd: cachedData.conversion_rates.USD,
        eur: cachedData.conversion_rates.EUR
      };
    } else {
      console.log('No cached data available, using fallback rates.');

      // Fallback rates in case both network and cache fail
      return {
        usd: 0.1, // Example fallback value for USD
        eur: 0.09 // Example fallback value for EUR
      };
    }
  }
}

function setPosition(selectedPosition) {
  position = selectedPosition;
  const salaryLevelSelect = document.getElementById('salaryLevel');
  salaryLevelSelect.innerHTML = '';

  if (position === 'firstOfficer') {
    ['F1', 'F2', 'F3', 'F4'].forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.text = level;
      salaryLevelSelect.add(option);
    });
  } else {
    ['C1', 'C2', 'C3', 'C4'].forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.text = level;
      salaryLevelSelect.add(option);
    });
  }

  nextStep();
}

function setSeason(selectedSeason) {
  season = selectedSeason;
  nextStep();
  populateSectorDropdowns();
}

function populateSectorDropdowns() {
  const sectorDropdownIds = ['s1', 's2', 's3', 's4', 'night'];
  
  sectorDropdownIds.forEach(id => {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '';

    for (let i = 0; i <= 50; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = i;
      dropdown.add(option);
    }
  });

  const layoverDropdownIds = ['internationalLayover', 'domesticLayover', 'ercanLayover'];

  layoverDropdownIds.forEach(id => {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '';

    for (let i = 0; i <= 50; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = i;
      dropdown.add(option);
    }
  });
}

function nextStep() {
  currentStep++;
  document.getElementById(`step${currentStep}`).style.display = 'block';
  if (currentStep > 2) {
    document.getElementById('nextButton').style.display = 'none'; // Hides the Next button after salary level selection
  }
  document.querySelector(`#step${currentStep}`).scrollIntoView({ behavior: 'smooth' });
}

async function calculateSalary() {
  const salaryLevel = document.getElementById('salaryLevel').value;
  if (!salaryLevel) {
    alert("Please select a salary level.");
    return;
  }
  const baseSalary = baseSalaries[salaryLevel];
  const sectorInputs = {
    S1: parseInt(document.getElementById('s1').value),
    S2: parseInt(document.getElementById('s2').value),
    S3: parseInt(document.getElementById('s3').value),
    S4: parseInt(document.getElementById('s4').value),
    Night: parseInt(document.getElementById('night').value)
  };

  let totalSectorPay = 0;
  Object.keys(sectorInputs).forEach(sector => {
    let sectorFee = sectorFees[position][sector];
    if (season === 'busy') {
      sectorFee *= 1.5;
    }
    totalSectorPay += sectorInputs[sector] * sectorFee;
  });

  document.getElementById('baseSalaryResult').innerText = baseSalary.toLocaleString();
  document.getElementById('sectorFeesResult').innerText = totalSectorPay.toLocaleString();

  const totalSalary = baseSalary + totalSectorPay;
  document.getElementById('salaryResult').innerText = totalSalary.toLocaleString();

  const internationalDays = parseInt(document.getElementById('internationalLayover').value);
  const domesticDays = parseInt(document.getElementById('domesticLayover').value);
  const ercanDays = parseInt(document.getElementById('ercanLayover').value);

  const rates = await fetchExchangeRates();

  const internationalLayoverFee = internationalDays * layoverRates.international * rates.eur;
  const domesticLayoverFee = domesticDays * layoverRates.domestic;
  const ercanLayoverFee = ercanDays * layoverRates.ercan;

  const totalLayoverFees = Math.round(internationalLayoverFee + domesticLayoverFee + ercanLayoverFee);

  document.getElementById('layoverResult').innerText = totalLayoverFees.toLocaleString() + ' TRY';

  const salaryUSD = (totalSalary + totalLayoverFees) * rates.usd;
  const salaryEUR = (totalSalary + totalLayoverFees) * rates.eur;

  document.getElementById('salaryUSD').innerText = salaryUSD.toFixed(2);
  document.getElementById('salaryEUR').innerText = salaryEUR.toFixed(2);

  document.getElementById('result').style.display = 'block';
  document.querySelector('#result').scrollIntoView({ behavior: 'smooth' });
}
