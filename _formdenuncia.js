
    const errorMsg2 = document.getElementById("error-msg-2")
    const errorContainer2 = document.getElementById("msg-ctn-2")
    const msgSuccess2 = document.getElementById("success-msg-2")
    const msgSuccessCtn2 = document.getElementById("success-ctn-2")
    
    const buttonFormDenuncia = document.getElementById("form-denuncia-send")
    const formDenuncia = document.getElementById("wf-form-Den-ncia")

    buttonFormDenuncia.addEventListener("click", async () => {

      errorMsg2.innerText = ""
      errorContainer2.style.display = "none"

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const name = document.getElementById("Nome").value
      const cpf = document.getElementById("cpf03").value
      const phone = document.getElementById("phone03").value
      const email = document.getElementById("e-mail").value
      const solicitation = document.getElementById("Solicita-2").value
      const assunto = document.getElementById("assunto-2").value
      const documentFiles = document.getElementById("documento-2")
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
      
      const formatCPF = (cpf) => cpf.replaceAll(".", "").replaceAll("-", "");
      const formatPhone = (phone) => phone.replace(/\D/g, "")

      const isEmailValid = emailRegex.test(email);
      const isNameValid = name.trim() !== "";
      const isPhoneValid = formatPhone(phone).length === 11;
      const isCPFValid = formatCPF(cpf).length === 11;
      const iSolicitationValid = solicitation.trim() !== "";

      if (!isNameValid) {
        errorMsg2.innerText = "Campo nome não deve estar vazio";
        errorContainer2.style.display = "block";
      } else if (!isCPFValid) {
        errorContainer2.style.display = "block"
        errorMsg2.style.display = "block"
        errorMsg2.innerText = "CPF inválido"
      } else if (!isPhoneValid) {
        errorContainer2.style.display = "block"
        errorMsg2.style.display = "block"
        errorMsg2.innerText = "Número de telefone inválido"
      } else if (!isEmailValid) {
        errorContainer2.style.display = "block"
        errorMsg2.style.display = "block"
        errorMsg2.innerText = "Email inválido"
      } else if (!iSolicitationValid) {
        errorContainer2.style.display = "block"
        errorMsg2.style.display = "block"
        errorMsg2.innerText = "Solicitação não pode estar vazio"
      } else {
        errorContainer2.style.display = "none";
        const cpfIsValid = await checkCPF(cpf)
        if (cpfIsValid) {
            await getProtocolDenuncia({ username: name, cpf: formatCPF(cpf), phone: formatPhone(phone), email, solicitation, assunto, fileObj })
        } else {
          errorContainer2.style.display = "block"
          errorMsg2.style.display = "block"
          errorMsg2.innerText = "CPF não identificado em nossa base de dados"
        }
      }

    })

    async function getProtocolDenuncia({ username, cpf, phone, email, solicitation, assunto, fileObj }) {
      preloader.style.display = "flex";
      const response = await fetch(`${urlAPI_Form}/forms`, {
        method: "POST",
        body: JSON.stringify({
          name: "Denúncia",
          data: {
            Nome: username,
            CPF: cpf,
            Telefone: phone,
            "e-mail": email,
            "Assunto": solicitation,
            "Resumo da solicitação": assunto,
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
        formDenuncia.style.display = "none"
        msgSuccessCtn2.style.display = "flex"
        msgSuccess2.innerText = `Sua mensagem foi enviada com sucesso e o seu protocolo de atendimento é ${protocol}. Em breve, a Capef irá contatá-lo.`
      } else {
        errorContainer2.style.display = "block"
        errorMsg2.style.display = "block"
        errorMsg2.innerText = "Erro ao gerar o número de ocorrência, tente novamente"
      }

    }

   function clearForm() {

  document.getElementById("wf-form-Atendimento-ao-Cliente").style.display ="flex"
 	
  formAttend.style.display = "flex"
  msgSuccessCtn.style.display = "none"
  msgSuccess.innerText = ""
  
  formDenuncia.style.display = "flex"
  msgSuccessCtn2.style.display = "none"
  msgSuccess2.innerText = ""
  
  formOuvidoria.style.display = "flex"
  msgSuccessCtn1.style.display = "none"

  document.getElementById("Nome-2").value = "";
  document.getElementById("cpf01").value = "";
  document.getElementById("phone01").value = "";
  document.getElementById("e-mail-2").value = "";
  document.getElementById("assunto").value = "";
  document.getElementById("Solicita-o").value = "";
  
  document.getElementById("Nome").value= "";
  document.getElementById("cpf03").value= "";
  document.getElementById("phone03").value= "";
  document.getElementById("e-mail").value= "";
  document.getElementById("Solicita-2").value= "";
  document.getElementById("assunto-2").value= "";
  
 	document.getElementById("Nome-3").value = ""
  document.getElementById("cpf02").value = ""
  document.getElementById("phone02").value = ""
  document.getElementById("e-mail-3").value = ""
  document.getElementById("assunto-1").value = ""
  document.getElementById("Solicita-1").value = ""
  document.getElementById("Protocolo-de-atendimento").value = ""
  
}

document.getElementById("back-form-1").addEventListener("click", ()=> clearForm())
document.getElementById("back-form-2").addEventListener("click", ()=> clearForm())
document.getElementById("back-form-3").addEventListener("click", ()=> clearForm())