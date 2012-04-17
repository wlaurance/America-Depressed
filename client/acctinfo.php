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
     var_dump($account);
?>
<html>
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
      Thank you for logging in, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>!
			</div>
			<br/>
			<br/>
			<div class="infotable">
			<table border="0" class="info">
				<tr>
        <td>First Name:</td><td><?php echo $profile->{'first_name'};?></td>
				</tr>
				<tr>
        <td>Last Name:</td><td><?php echo $profile->{'last_name'};?></td>
				</tr>
				<tr>
        <td>SSN:</td><td><?php echo $profile->{'ssn'};?></td>
				</tr>
				<tr>
        <td>Gender:</td><td><?php echo $profile->{'gender'};?></td>
				</tr>
				<tr>
        <td>City:</td><td><?php echo $profile->{'city'};?></td>
				</tr>
				<tr>
        <td>State:</td><td><?php echo $profile->{'state'};?></td>
				</tr>
				<tr>
        <td>Zip:</td><td><?php echo $profile->{'zip'};?></td>
				</tr>
				<tr>
        <td>Credit Score:</td><td><?php echo $profile->{'credit_score'};?></td>
				</tr>
				<tr>
        <td>Account Number:</td><td><?php 
     if(isset($account->{'account_num_a'}))
       echo $account->{'account_num_a'};
     else
       echo $account->{'account_num_i'};
     ?></td>
				</tr>
				<tr>
        <td>Active?:</td><td><?php 
        if(isset($account->{'account_num_a'}))
          echo 'Y';
        else
          echo 'N';
    ?></td>
				</tr>
			</table> 
			</div>
			<table border="0">
			<tr><td><form action="update.php" method="get"><input type="submit" value="Update" /></form></td>
			<td><form action="payment.php" method="get"><input type="submit" value="Payments" /></form></td>
			<td><form action="charge.php" method="get"><input type="submit" value="Charges" /></form></td>
			<td><form action="rewardstore.php" method="get"><input type="submit" value="Reward Store" /></form></td>
			<td><form action="logout.php" method="get"><input type="submit" value="Log Out" /></form></td>
			</tr>
			<br/>
		</div>
		
		</center>
	</body>
</html>
<?php 
}
?>
