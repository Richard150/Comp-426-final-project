$(function() {
    const $signupForm = $('#signup-form');
    const $signupMessage = $('#signupMessage');

    $signupForm.submit(async function(e) {
        e.preventDefault();
    
        $signupMessage.html('');
    
        const data = $signupForm.serializeArray().reduce((o, x) => {
          o[x.name] = x.value;
          return o;
        }, {});
        console.log(data);
      
        let sign = await signIn(data);
        if (sign === true) {
            $signupMessage.html('<span class="has-text-success">Success! You are now signed up.</span>');
        } else {
            $signupMessage.html('<span class="has-text-danger">Something went wrong and you were not signed up. Check your email and password and your internet connection.</span>');
        }

        /*$.ajax({
          url: 'http://localhost:3004/signup',
          type: 'POST',
          data,
          /*xhrFields: {
              withCredentials: true,
          },
        }).then(() => {
            console.log(data);
            $signupMessage.html('<span class="has-text-success">! You are now signed up.</span>');
        }).catch(() => {
          $signupMessage.html('<span class="has-text-danger">Something went wrong and you were not signed up. Check your email and password and your internet connection.</span>');
        });*/
    });
});


async function signIn(url, data) {
    //let theUrl = 'https://comp426-1fa20.cs.unc.edu/a09/tweets/' + id + '/unlike'
    const result = await axios({
        method: 'post',
        url: 'http://localhost:3005/signup',
        withCredentials: true,
        data: data,
    });
    return result.data;
}

