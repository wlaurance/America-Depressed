<?php
  session_start();
  require_once('lib/api.php');
  if ($_SERVER["REQUEST_METHOD"] == 'POST')
  {
    if ($_POST['username'] != '' && $_POST['password'] != '')
    {
      $profile = login($_POST['username'], $_POST['password']);
      if (isset($profile->{'error_message'}))
        makeForm($profile->{'error_message'});
      else {
        header('Location: acctinfo.php');
      }
    } else {
      makeForm('Requires both a username and password.');
    }
  } 
  else
  {
    makeForm();
  }

function makeForm($errors = '')
  {
?>
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="http://www.cs.wm.edu/~elcole/public/acctinfo.css" />
		<title>America Depressed</title>
	</head>
	
	<script type=text/javascript>
		function goto(){
			window.location="http://www.americanexpress.com";
		}
	</script>

	<body>
		<center>
		<div class="headerimage">
			<img src="http://www.cs.wm.edu/~elcole/public/ad.png"/>
		</div>
		<br/>
		
		<div class="content">
			<div class="must">
				You must be logged in to continue.  Please log in below.
			</div>
			<br/>
			<div class="login">
				Log In to Your Account
				<br/>
				<br/>
        <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
					Username: <input type="text" name="username" size="25" /><br />
					Password: <input type="password" name="password" size="25" /><br />
					<p><input type="submit" value="Login" /><input type="button" value="Cancel" onclick=goto() />
					</p>
        </form>
        <?php if($errors != ''){ ?>
          <div class="errors">
          <?php echo $errors; ?>
          </div>
        <?php } ?>
        
			</div>
			<br/>
		</div>
	
		</center>
  </body>
</html><?php } ?>
