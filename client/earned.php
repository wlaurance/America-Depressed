<?php
session_start();
require_once('lib/api.php');
if (isset($_SESSION['token']))
  print_info();
else
  header("Location: login.php");
 function print_info()
   {
     $profile = $_SESSION['profile'];
     $profile = $profile->{'profile'};
     $account = account();
     $account = $account->{'account'};
     $type = $_GET["t"];
     $amount = $_GET["p"];
?>
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="http://www.cs.wm.edu/~elcole/public/rewards.css" />
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
      You have earned the following rewards, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>.
			</div>
			<br/>
			<br/>

			<div class="infotable">
			<table border="0" class="info">
			<tr><td><b>Name</b></td><td><b>Type</b></td><td><b>Value</b></td></tr>
			<tr><td>Reward #1</td><td>Sweepstakes</td><td>100</td></tr>
			<tr><td>Reward #2</td><td>Merchandise</td><td>250</td></tr>

			</table> 
			</div>
			<br/>
			<table border="0"><tr>
			<td><form action="acctinfo.php" method="get"><input type="submit" value="Home" /></form></td>
			<td><form action="rewardstore.php" method="get"><input type="submit" value="Reward Store Home" /></form></td>
			<td><form action="store.php" method="get"><input type="submit" value="Redeem Points" /></form></td>
			<td><form action="logout.php" method="get"><input type="submit" value="Log Out" /></form></td>
			</tr>
			</table>

		</div>
		
		</center>
	</body>
</html>
<?php 
}
?>
