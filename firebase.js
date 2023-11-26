const firebaseConfig = {
    apiKey: "AIzaSyDKFCS6Vcuaq0g-50KG2hUw4HSFXlnrSpI",
    authDomain: "aplicativogti-904fa.firebaseapp.com",
    projectId: "aplicativogti-904fa",
    storageBucket: "aplicativogti-904fa.appspot.com",
    messagingSenderId: "37261807667",
    appId: "1:37261807667:web:8e22ef7705350872685346"
  };
  
  //Inicializando o Firebase
  firebase.initializeApp(firebaseConfig)
  //Definindo a URL padrão do site
  const urlApp =  'http://127.0.0.1:5500'
  
  function logaGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        window.location.href = 'index.html'
      }).catch((error) => {
        alert(`Erro ao efetuar o login: ${error.message}`)
      })
  }
  
  function verificaLogado() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) { //Contém dados do login?
        //Salvamos o id do usuário localmente
        localStorage.setItem('usuarioId', user.uid)
  
        //Inserindo a imagem do usuário      
        let imagem = document.getElementById('imagemUsuario')
  
        user.photoURL
        ? imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle" width="48" />`
        : imagem.innerHTML += '<img src="imagens/logo-google.svg" title="Usuário sem foto" class="img rounded-circle" width="32" />'

      } else {
        localStorage.removeItem('usuarioId') //Removemos o id salvo
        window.location.href = 'index.html' //direcionamos para o login        
      }
    })
  }
  
  function logoutFirebase() {
    firebase.auth().signOut()
      .then(function () {
        localStorage.removeItem('usuarioId')
        window.location.href = 'index.html'
      })
      .catch(function (error) {
        alert(`Não foi possível efetuar o logout: ${error.message}`)
      })
  }
  
  async function salvaPrestador(prestador) {
    //obtendo o usuário atual
    let usuarioAtual = firebase.auth().currentUser
    try {
      await firebase.database().ref('prestadores').push({
        ...prestador,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName
        }
      })
      alert('✔ Registro incluído com sucesso!')
    
      //Limpar o formulário
      document.getElementById('formCadastro').reset()
    
    } catch (error) {
      alert(`❌Erro ao salvar: ${error.message}`)
    }
  }
  //evento submit do formulário
  document.getElementById('formCadastro').addEventListener('submit', function(event){
    event.preventDefault() // evita o recarregamento
    const prestador = {
      razao: document.getElementById('razao').value,
      cep: document.getElementById('cep').value,
      endereco: document.getElementById('endereco').value,
      latitude: document.getElementById('lat').value,
      longitude: document.getElementById('long').value
    }
    salvaPrestador(prestador)
  })
  
  async function carregaPrestadores(){
    const tabela = document.getElementById('dadosTabela')
    const usuarioAtual = localStorage.getItem('usuarioId')
  
    await firebase.database().ref('prestadores').orderByChild('razao')
    .on('value',(snapshot) => {
      //Limpamos a tabela
      tabela.innerHTML = ``
      if(!snapshot.exists()) { //não existe o snapshot?
        tabela.innerHTML = `<tr class='table-danger'><td colspan='4'>Ainda não existe nenhum registro cadastrado.</td></tr>`
      } else { //se existir o snapshot, montamos a tabela
        snapshot.forEach(item => {
          const dados = item.val() // obtém os dados
          const id = item.key // obtém o id
          
          const isUsuarioAtual = (dados.usuarioInclusao.uid === usuarioAtual)
          const botao = isUsuarioAtual
          ? `<button class='btn btn-sm btn-danger' onclick='removePrestador("${id}")'
             title='Excluir o registro atual'>🗑 Excluir</button>`
          : `🚫Indisponível`   
  
          tabela.innerHTML += `
          <tr>
             <td>${dados.razao}</td>
             <td>${dados.endereco}-${dados.cep}</td>
             <td>${dados.latitude} / ${dados.longitude}</td>
             <td>${botao}</td>
          </tr>
          `
        })
      }
    })
  }
  
  async function removePrestador(id){
    if(confirm('Deseja realmente excluir o prestador?')){
      const prestadorRef = await firebase.database().ref('prestadores/'+id)
  
      //Remova o prestador do Firebase
      prestadorRef.remove()
      .then(function(){
        alert('Prestador excluído com sucesso!')
      })
      .catch(function(error){
        alert(`Erro ao excluir o prestador: ${error.message}. Tente novamente`)
      })
    }
  }