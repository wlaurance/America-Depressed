<?php
session_start();
require_once('lib/api.php');
if (isset($_SESSION['token']))
{
  $rewarda = getRewardAccount();
  $rewarda = $rewarda->{'rewards_account'};
  $reward = array();
  $reward['type'] = $_GET['type'];
  $reward['id'] = $_GET['id'];
  $entry = redeemReward($reward, $rewarda->{'acct_id'});
  $entry = $entry->{'rewards_message'};

  print_info($entry);
}
else
  header("Location: login.php");
 function print_info($entry)
   {
     $profile = getProfile();
     $profile = $profile->{'profile'};
     $account = account();
     $account = $account->{'account'};
     $rewarda = getRewardAccount();
     $rewarda = $rewarda->{'rewards_account'};
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
      Welcome to the Reward Store, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>.  You have <?php echo $rewarda->{'points'}; ?> points.
			</div>
			<br/>
			<br/>

			<div class="infotable">
			<br/>

      <?php echo $entry; ?>
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
  $rewards = getRewards($type, $amount);
  foreach ($rewards->{'rewards'} as $item){
    if($type == "s") { ?>
      <tr><td><?php echo $item->{'name'}; ?></td><td><?php echo $item->{'cost'}; ?></td><td><?php echo $item->{'entries'}; ?></td><td><?php echo $item->{'end_date'}; ?>
    </td><td><form style="margin:0; text-align:center;" action="redeem.php" 
      method="GET"><input type="submit" value="Redeem" /><input type="hidden" name="type" value="sweep"/><input type="hidden" name="id" value="<?php echo $item->{'sweep_id'}; ?>"/></form></td></tr>
  <?php }
    else { ?>
      <tr><td><?php echo $item->{'name'}; ?></td><td><?php echo $item->{'cost'}; ?></td><td><?php echo $item->{'quantity'}; ?></td><td><form style="margin:0; text-
      align:center;" action="redeem.php?id=<?php echo $item->{'merch_id'};?>&type=merch" method="GET"><input type="submit" 
      value="Redeem" /><input type="hidden" name="type" value="merch"/><input type="hidden" name="id" value="<?php echo $item->{'merch_id'}; ?>"/></form></td></tr>
  <?php }
  }
}

}
?>
