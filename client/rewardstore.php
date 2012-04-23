<?php
session_start();
require_once('lib/api.php');
if (isset($_SESSION['token']))
  print_info();
else
  header("Location: login.php");
 function print_info()
   {
     $profile = getProfile();
     $profile = $profile->{'profile'};
     $account = account();
     $account = $account->{'account'};
     $rewarda = getRewardAccount();
     $rewarda = $rewarda->{'rewards_account'}
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
      Welcome to the Reward Store, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>!
			</div>
			<br/>
			<br/>
			<div class="infotable">
			<table border="0" class="info">
				<tr>
        <td>Reward Account Number:</td><td><?php echo $rewarda->{'acct_id'}; ?></td>
				</tr>
				<tr>
        <td>Points Balance:</td><td><?php echo $rewarda->{'points'}; ?></td>
				</tr>
				<tr>
        <td>Active:</td><td><?php echo $rewarda->{'active'}; ?></</td>
				</tr>
			
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
