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
      Welcome to the Reward Store, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>.  You have 748643214324856 points.
			</div>
			<br/>
			<br/>

			<div class="infotable">
			<h2><?php if($type=="s")
					echo "Sweepstakes";
					if ($type=="m")
						echo "Merchandise"; ?></h2>
			<br/>
			<table border="0" class="info">
			
				<?php printcoltitles($type); ?>
				<?php printrewards($type, $amount); ?>


			</table> 
			</div>
			<br/>
			<table border="0"><tr>
			<td><form action="acctinfo.php" method="get"><input type="submit" value="Home" /></form></td>
			<td><form action="rewardstore.php" method="get"><input type="submit" value="Reward Store" /></form></td>
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
function printcoltitles($type){
	if ($type == "s") { ?>
		<tr><td><b>Name of Reward</b></td><td><b>Cost</b></td><td><b>Current Entries</b></td><td><b>End 					Date</b></td><td></td></tr>
<?php }
	else { ?>
		<tr><td><b>Name of Reward</b></td><td><b>Cost</b></td><td><b>Quantity Remaining</b></td><td></td></tr>
<?php }

function printrewards($type, $amount){
	if($type == "s") { ?>
		<tr><td>This would be a sweep</td><td>Cost</td><td>Entries</td><td>end_date
		</td><td><form style="margin:0; text-align:center;" action="redeem.php?id=INSERT ID HERE" 
		method="get"><input type="submit" value="Redeem" /></form></td></tr>
<?php }
	else { ?>
		<tr><td>This would be a merch</td><td>Cost</td><td>Quantity</td><td><form style="margin:0; text-
		align:center;"action="redeem.php?id=INSERT ID HERE" method="get"><input type="submit" 
		value="Redeem" /></form></td></tr>
<?php }
}

}
?>
