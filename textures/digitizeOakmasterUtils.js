
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


// const BASE_API_PATH = 'http://localhost:3000';
const BASE_API_PATH = 'https://postmark-server.herokuapp.com';
// const BASE_API_PATH = 'https://oakmaster-proxy.3kit.com';
const TRUSS_PDF_API_PATH = '/api/pdf/truss';
const GARAGE_PDF_API_PATH = '/api/pdf/garage';

const GARAGE_LENGTH_PER_BAY_FACTOR = 2.75;

const trussInitialPDFData = {
    "sampleImage": "https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/truss-new.png",
    "oakmasterLogo":'https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/oakmaster-new-logo.jpg',
    data: {}
  }
  const garageInitialPDFData = {
      "sampleImage": "https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/garage-new.png",
      "oakmasterLogo":'https://raw.githubusercontent.com/theVineetTanwar/theVineetTanwar/main/oakmaster-new-logo.jpg',
      data: {}
    }

const getFormattedCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {style: 'currency',  currency: 'GBP',}).format(amount);
}

function getPDFGenerationCompatibleData (type='garage', data = {}, price=100000, woodMass = 0) {
    const vatPrice = price * 0.2;
    const initialPDFData = type === 'garage' ? garageInitialPDFData : trussInitialPDFData
    const pdfData = {
        ...initialPDFData,
        data:{
            ...data,
            netPrice: getFormattedCurrency((price / 100).toFixed(2)),
            vatPrice: getFormattedCurrency((vatPrice / 100).toFixed(2)),
            grossPrice: getFormattedCurrency(((price + vatPrice) / 100).toFixed(2))
        }
    };

    if(type === 'garage'){
        pdfData['data'] = {
            ...pdfData['data'],
            logLength: (data["Left Log Store"] || data["Right Log Store"]) ? '3.4m' : null,
            logWidth: (data["Left Log Store"] || data["Right Log Store"]) ? '1.2m' : null,
            garageHeight:  data["Roof Pitch"] === '35-Deg' ? '4m' : '4.84m',
            garageWidth:  data["Roof Pitch"] === '40-Deg With Catslide' ? '6.8m' : '5.6m',
            garageLength:  ((parseInt(data["Number Of Bays"]) * GARAGE_LENGTH_PER_BAY_FACTOR) + 'm'),
        }
    }else{
        pdfData['data'] = {
            ...pdfData['data'],
            woodMass: woodMass + ' Kg'
        }
    }

    var form_data = new FormData();
    for ( var key in pdfData ) {
        form_data.append(key, item[key]);
    }
    
    if(threekit){
        threekit.api.commands.setCommandOptions('snapshot', {
            // dataType: dataType,
            // camera: camera,
            width: 800,
            height: 500,
          });
        var result = threekit.api.commands.runCommand('snapshot');
        if (result) {
            var resultImage = document.getElementById('resultImage');
            resultImage.src = dataType === 'dataURL' ? result : URL.createObjectURL(result);
        }

        form_data.append('file', result)
    }

    
    
    // return pdfData;
    return form_data;
}



function getPDFByDigitize (type='garage', data = garageSampleData, price=100000, woodMass = 0) {
    const pdfData = getPDFGenerationCompatibleData(type, data, price, woodMass);

    fetch(BASE_API_PATH + (type === 'truss' ? TRUSS_PDF_API_PATH : GARAGE_PDF_API_PATH), {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(pdfData),
    }).then(async(response) => {
        if (response.ok) {
            return response.blob();
        } else {
            window.alert('Could not get PDF, Please try again')
            throw new Error('Something went wrong');
        }
    }).then(function(data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', type + '.pdf');
        document.body.appendChild(link);
        link.click();
    });
}

function customBlobToBase64 (blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };



function sendEmailByDigitize (type='garage', data = {}, price=100, woodMass = 0, emailData = {}) {
    if(!emailData.name){
        window.alert('Please provide your name');
        return false;
    }
    if(!emailData.email){
        window.alert('Please provide your email');
        return false;
    }
    if(!emailData.country){
        window.alert('Please provide your country');
        return false;
    }
    const pdfData = getPDFGenerationCompatibleData(type, data, price, woodMass);

    fetch(BASE_API_PATH + (type === 'truss' ? TRUSS_PDF_API_PATH : GARAGE_PDF_API_PATH), {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(pdfData),
    }).then(response => response.blob())
    .then(function(data) {
        customBlobToBase64(data).then(res => {
            const attachment = [
              {
                "Name": type+".pdf",
                "Content": res.replace("data:application/pdf;base64,", ""),
                "ContentType": "application/pdf"
              }
            ]
     
            const postData = {
               "recieverEmail": emailData.email,
               "first_name": emailData.name,
               "Attachments" : attachment
             }

            fetch(BASE_API_PATH + '/sendEmailWithTemplate', {
                  method: 'POST',
                  headers: new Headers({ 'Content-Type': 'application/json' }),
                  body: JSON.stringify(postData),
                })
                  .then(res => res.json())
                  .then(function(data) {
                    if(data?.status){
                        if(document.getElementById('digitize-user-email').value){
                            document.getElementById('digitize-user-email').value = "";
                            document.getElementById('digitize-user-name').value = "";
                            document.getElementById('digitize-user-country').value = "";
                        }
                        window.alert('Email Sent Successfully')
                    }else{
                        window.alert('Unable to send email. Please check email and try again')
                    }
                  });
            });
    });
}
