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
      Welcome to the Reward Store, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>.  You have 748643214324856 points.
			</div>
			<br/>
			<br/>
			<div class="infotable">
			<table border="0" class="info">
				<tr><td><b>Sweepstakes</b></td></tr>
				<tr><td><a href="list.php?t=s&p=100">100 points</a> </td></tr>
				<tr><td><a href="list.php?t=s&p=300">300 points</a> </td></tr>
				<tr><td><b>*********************************************</b></td></tr>	
				<tr><td><b>Merchandise</b></td></tr>
				<tr><td><a href="list.php?t=m&p=100">0-100 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=200">101-200 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=300">201-300 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=400">301-400 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=500">401-500 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=600">501-600 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=700">601-700 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=800">701-800 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=900">801-900 points</a> </td></tr>
				<tr><td><a href="list.php?t=m&p=1000">901-1000 points</a> </td></tr>
			</table> 
			</div>
			<br/>
						<table border="0">
			<td><form action="acctinfo.php" method="get"><input type="submit" value="Home" /></form></td>
			<td><form action="store.php" method="get"><input type="submit" value="Redeem Points" /></form></td>
			<td><form action="earned.php" method="get"><input type="submit" value="Earned Rewards" /></form></td>
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
