<?php
//for listing info:
//d refers to the type of request: a = accounts, r = rewards
//t refers to the type of data: a = active, i = inactive, ba = both accounts, m = mech, s = sweep, 
//br = both rewards

session_start();
require_once('lib/api.php');
if (isset($_SESSION['admintoken']))
  print_info();
else
  header("Location: adminlogin.php");
 function print_info()
   {
   		$type = $_GET["d"];
   		$want = $_GET["t"];
      if(isset($_GET["i"]))
      {
        if($_GET["i"] == 'charge')
          chargeInterest();
      }
      ?>
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="http://www.cs.wm.edu/~elcole/public/admin.css" />
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
		  		Welcome, Admin <?php echo $_SESSION['adminname']; ?>!
			</div>
			<br/>
			<br/>
			<div class="infotable">
				<h2><?php echo "Listing ";
						if($want=="i")
							echo "Inactive ";
						else if($want=="a")
							echo "Active ";
						else if($want=="m")
							echo "Merchandise ";
						else if($want=="s")
							echo "Sweepstakes ";
						else
							echo "All "; 
						
						if($type=="a")
							echo "Accounts";
						else
							echo "Rewards";?></h2>
				<br/>
				<table border="0" class="info">
			
					<?php printcoltitles($type, $want); ?>
					<?php printinfo($type, $want); ?>


				</table> 
			</div>
			<br/>
			<table border="0"><tr>
				<td><form action="adminhome.php" method="get"><input type="submit" value="Home" /></form></td>
				<td><form action="adminlogout.php" method="get"><input type="submit" value="Log Out" /></form></td>
				</tr>
			</table>

		</div>
		
		</center>
	</body>
</html>	

<?php 
}

function printcoltitles($type, $want){
  if ($type == "a")
    $accounts = getAccounts($want);
  else if ($type == "r")
    $rewards = getRewards($want);

	if ($type == "a") { ?>
		<tr><td><b>Account Number</b></td><td><b>First Name</b></td><td><b>Last Name</b></td><td><b>SSN</b></td><td><b>Balance</b></td><td><b>Active?</b></td></tr>
<?php
    foreach($accounts as $account){
      if (isset($account->{'balance'}))
        $balance = $account->{'balance'};
      else
        $balance = '---';
      $active = 'Y';
      if (isset($account->{'account_num_i'}))
        $active = 'N';

?>
  <tr><td><?php echo $account->{'account_num'}; ?></td><td><?php echo $account->{'first_name'};?></td><td><?php echo $account->{'last_name'};?></td><td><?php echo $account->{'ssn'}; ?></td><td><?php echo $balance; ?></td><td><?php echo $active; ?></td></tr>
<?php }
  }
    
	else { ?>
		<tr><td><b>Reward Number</b></td><td><b>Name</b></td><td><b>Type</b></td><td><b>Cost</b></td></tr>
<?php }

function printinfo($type, $want){
	//not sure what you need me to do here. This is where it would print based on the type.
	//see above for column names... didn't want to list everything for the account info. Just did the
	//basics.  same with rewards.
  }
}
?>
