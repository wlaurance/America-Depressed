<?php
session_start();
require_once('lib/api.php');
if (isset($_SESSION['token']) && $_SERVER['REQUEST_METHOD'] == 'GET')
  print_info();
else if ($_SERVER['REQUEST_METHOD'] == 'POST'){
  makePayment($_POST);
  header("Location: acctinfo.php");
}
else
  header("Location: login.php");
 function print_info()
   {
     $profile = $_SESSION['profile'];
     $profile = $profile->{'profile'};
     $account = account();
     $account = $account->{'account'};
?><html>
	<head>
		<link rel="stylesheet" type="text/css" href="http://www.cs.wm.edu/~elcole/public/acctinfo.css" />
		<title>America Depressed</title>
	</head>
	
	<body>
		<center>
		<div class="headerimage">
			<img src="http://www.cs.wm.edu/~elcole/public/ad.png"/>
		</div>
		<br/>
		
		<div class="content">
			<div class="title">
     		Welcome, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>!
			</div>
			<br/>
			<br/>
			<div class="payment">
				Make a Payment on Your Account
				<br/>
				<br/>
				Your account number is: <?php echo $account->{'account_num_a'}; ?>
				<br/>
				Your account balance is: <?php echo $account->{'balance'}; ?>
			<br/>
			<br/>
			<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post">
			<table border="0" class="info">
				<tr>
        		<td>Payment Date:</td><td><input type="text" name="charge_date" size="25" /></td>
				</tr>
				<tr>
        		<td>Amount:</td><td><input type="text" name="amount" size="25" /></td>
				</tr>
				<tr></tr>
				<tr></tr>
				<tr></tr>
				<tr>
				<td><input type="submit" value="Make Payment"/></td>
				<td><input type="reset" value="Clear"/></td>
				</tr>

			</table>
			</form>
			</div>
			<br/>
						<table border="0">
			<td><form action="acctinfo.php" method="get"><input type="submit" value="Home" /></form></td>
			<td><form action="rewardstore.php" method="get"><input type="submit" value="Reward Store" /></form></td>
			<td><form action="logout.php" method="get"><input type="submit" value="Log Out" /></form></td>
			</tr>
			</table>
			<br/>
			
		</div>
		</center>
	</body>
</html>
<?php }
?>
