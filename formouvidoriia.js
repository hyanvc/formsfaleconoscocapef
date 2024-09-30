
const errorMsg1 = document.getElementById("error-msg-1")
const errorContainer1 = document.getElementById("msg-ctn-1")
const msgSuccess1 = document.getElementById("success-msg-1")
const msgSuccessCtn1 = document.getElementById("success-ctn-1")
 
 async function validateProtocol({ cpf, protocol }) {

  const response = await api(`${urlConsulta}/Validar/Protocolo/Tactium/?NrProtocolo=${protocol}&CPF=${cpf}`, {
    key: urlConsulta
  })
         return true;
  // console.log(response)

  // if (response.valido) {
  //   return response.valido
  // } else {
  //   errorMsg1.innerText = "Numero do Protocolo inválido";
  //   errorContainer1.style.display = "block";
  //   return false
  // }

}


const buttonFormOuvidoria = document.getElementById("form-ouvidoria-send")
const formOuvidoria = document.getElementById("wf-form-Ouvidoria")

buttonFormOuvidoria.addEventListener("click", async () => {

  errorMsg1.innerText = ""
  errorContainer1.style.display = "none"

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const name = document.getElementById("Nome-3").value
  const cpf = document.getElementById("cpf02").value
  const phone = document.getElementById("phone02").value
  const email = document.getElementById("e-mail-3").value
  const assunto = document.getElementById("assunto-1").value
  const solicitation = document.getElementById("Solicita-1").value
  const oldProtocol = document.getElementById("Protocolo-de-atendimento").value 

  const documentFiles = document.getElementById("documento-1")
        const fileObj = {
    name: "",
    type: "",
    base64: null
  }
  
        if (documentFiles.files.length > 0) {
  
        const file = documentFiles.files[0];
      const reader = new FileReader();
      
      reader.onloadend = function () {
        const base64String = reader.result.split(",")[1];
        fileObj.name = file.name
        fileObj.type = file.type
        fileObj.base64 = base64String
      }
      
      reader.readAsDataURL(file);
      
  }

  const isEmailValid = emailRegex.test(email);
  const isNameValid = name.trim() !== "";
  const isPhoneValid = formatPhone(phone).length === 11;
  const isCPFValid = formatCPF(cpf).length === 11;
  const iSolicitationValid = solicitation.trim() !== "";
  const isValidProtocol = oldProtocol.trim() !== ""


  if (!isNameValid) {
    errorMsg1.innerText = "Campo nome não deve estar vazio";
    errorContainer1.style.display = "block";
  } else if (!isCPFValid) {
    errorContainer1.style.display = "block"
    errorMsg1.style.display = "block"
    errorMsg1.innerText = "CPF inválido"
  } else if (!isPhoneValid) {
    errorContainer1.style.display = "block"
    errorMsg1.style.display = "block"
    errorMsg1.innerText = "Número de telefone inválido"
  } else if (!isEmailValid) {
    errorContainer1.style.display = "block"
    errorMsg1.style.display = "block"
    errorMsg1.innerText = "Email inválido"
  } else if (!iSolicitationValid) {
    errorContainer1.style.display = "block"
    errorMsg1.style.display = "block"
    errorMsg1.innerText = "Solicitação não pode estar vazio"
  }else if(!isValidProtocol){
    errorContainer1.style.display = "block"
    errorMsg1.style.display = "block"
    errorMsg1.innerText = "Numero de protocolo inválido"
  }else {
    errorContainer1.style.display = "none";
    const cpfIsValid = await checkCPF(cpf)
    if (cpfIsValid) {
     await getProtocolOuvidoria({ username: name, cpf: formatCPF(cpf), phone: formatPhone(phone), email, oldProtocol, solicitation, assunto, fileObj })
    } else {
      errorContainer1.style.display = "block"
      errorMsg1.style.display = "block"
      errorMsg1.innerText = "CPF não identificado em nossa base de dados"
    }
    
  }

})

async function getProtocolOuvidoria({ username, cpf, phone, email, oldProtocol, solicitation, assunto,fileObj  }) {

const checkProtocol = await validateProtocol({ cpf, protocol: oldProtocol })
  preloader.style.display = "flex";
  
  console.log(checkProtocol)

  if(!checkProtocol){
      preloader.style.display = "none";
      return;
  }

  const response = await fetch(`${urlAPI_Form}/forms`, {
    method: "POST",
    body: JSON.stringify({
      name: "Ouvidoria",
      data: {
        Nome: username,
        CPF: cpf,
        Telefone: phone,
        "e-mail": email,
        "Assunto": solicitation,
        "Resumo da solicitação": assunto,
        "Protocolo de atendimento": oldProtocol,
        file: fileObj
      }
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  preloader.style.display = "none";

  const data = await response.json()
  const protocol = data.protocol

  if (protocol && response.status >= 200 && response.status <= 204 && protocol !== "Erro ao gerar protocolo") {

    const responseExportProtocol = (async () => {

try {
 

   const response = await fetch(`${urlConsulta}/Exportar/${cpf}/${email}/${protocol}/${username}`, {

       method: 'POST',

       headers: { 'Content-Type': 'application/json' },

       body: JSON.stringify({ key: urlConsulta })

   });



   if (!response.ok) {

       throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);

   }


   const result = await response.json();

   return result;

} catch (error) {

   console.error('Erro:', error);

}

})();
    formOuvidoria.style.display = "none"
    msgSuccessCtn1.style.display = "flex"
    msgSuccess1.innerText = `Sua mensagem foi enviada com sucesso e o seu protocolo de atendimento é ${protocol}. Em breve, a Capef irá contatá-lo.`
  } else {
    errorContainer1.style.display = "block"
    errorMsg1.style.display = "block"
    errorMsg1.innerText = "Erro ao gerar o número de ocorrência, tente novamente"
  }

}

