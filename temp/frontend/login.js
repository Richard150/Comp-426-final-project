$(function() {
    const $loginForm = $('#login-form');
    const $loginMessage = $('#loginMessage');
  
    $loginForm.submit(function(e) {
      e.preventDefault();
  
      $loginMessage.html('');
  
      const data = $loginForm.serializeArray().reduce((o, x) => {
        o[x.name] = x.value;
        return o;
      }, {});
    
      let theUrl = 'x'
      $.ajax({
        url: theUrl,
        type: 'POST',
        data,
        xhrFields: {
            withCredentials: true,
        },
      }).then(() => {
        $loginMessage.html('<span class="has-text-success">You are now logged in.</span>');
      }).catch(() => {
        $loginMessage.html('<span class="has-text-danger">Something went wrong and you were not logged in. Check your username and password and your internet connection.</span>');
      });
    });
})

  export async function index() {
    const result = await axios({
        method: 'get',
        url: 'localhost:3030/account',
        withCredentials: true,
    });
    return result.data; 
}