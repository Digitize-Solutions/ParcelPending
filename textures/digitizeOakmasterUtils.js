
const trussSampleData = {
    "Braces": true,
    "Brace Offset": 0,
    "Size": "Regular",
    "Brace Curve": 0,
    "Truss Type": "King (Simple)",
    "Rafter Height (mm)": 150,
    "Roof Pitch Angle": 35,
    "Brace Width (mm)": 100,
    "Wall Depth (mm, in addition to span)": 200,
    "Brace Height (mm)": 100,
    "Rafter Width (mm)": 125,
    "King Post Width (mm)": 225,
    "Truss Quantity": 1,
    "King Post Depth (mm)": 125,
    "Tie Beam Span (mm)": 4000,
    "Tie Beam Height (mm)": 150,
    "Tie Beam Width (mm)": 125
}

const garageSampleData = {
    "Door 2": true,
    "Door 3": true,
    "Right Log Store": true,
    "Door 4": true,
    "Right Roof Type": "Barn-Hip",
    "View": "Outside",
    "Wall Cladding Material": "Oak",
    "Number Of Bays": "4",
    "Left Log Store": true,
    "Left Roof Type": "Full-Hip",
    "Roof Pitch": "35-Deg",
    "Tour": "Top",
    "Door Material": "Softwood",
    "Partition 1": true,
    "Partition 2": true,
    "Partition 3": true,
    "Door 1": true
}


// const BASE_API_URL = 'http://localhost:3000';
const BASE_API_URL = 'https://postmark-server.herokuapp.com';
const TRUSS_PDF_URL = '/api/pdf/truss';
const GARAGE_PDF_URL = '/api/pdf/garage';

const GARAGE_LENGTH_PER_BAY_FACTOR = 2.75;

const trussInitialPDFData = {
    "sampleImage": "https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/truss-image.jpg",
    "oakmasterLogo":'https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/oakmaster-logo.png',
    data: {}
  }
  const garageInitialPDFData = {
      "sampleImage": "https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/oakmasters-icon.jpg",
      "oakmasterLogo":'https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/oakmaster-logo.png',
      data: {}
    }



function sendEmailByDigitize (type='garage', data = {}, price=100) {
    console.log('send email is clicked');
    const vatPrice = price * 0.2;

    const initialPDFData = type === 'garage' ? garageInitialPDFData : trussInitialPDFData

    const pdfData = {
        ...initialPDFData,
        data:{
            ...data,
            netPrice: price,
            vatPrice: vatPrice,
            grossPrice: price + vatPrice
        }
    };

    if(type === 'garage'){
        pdfData['data'] = {
            ...pdfData['data'],
            logLength: (data["Left Log Store"] || data["Right Log Store"]) ? '3.4m' : '0m',
            logWidth: (data["Left Log Store"] || data["Right Log Store"]) ? '1.2m' : '0m',
            garageHeight:  data["Roof Pitch"] === '35-Deg' ? '4m' : '4.84m',
            garageLength:  parseInt(data["Number Of Bays"]) * GARAGE_LENGTH_PER_BAY_FACTOR,
        }
    }

    fetch(BASE_API_URL + (type === 'truss' ? TRUSS_PDF_URL : GARAGE_PDF_URL), {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(pdfData),
    }).then(response => response.blob())
    .then(function(data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');
        document.body.appendChild(link);
        link.click();
    });
          



}
