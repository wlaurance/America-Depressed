<?php
	//same idea here to update files...
	//t refers to type to update: a=account, r=reward
	
	//also, can you make it do a "Thank you for updating Account/Reward Number: 623472361590" message 
	//when you click update? like the redeem rewards stuff :D

	//when an account is updated, the interest rate is based on the credit score. I will have to get 
	//you the algorithm that I used to get the interest rates.

session_start();
require_once('lib/api.php');
if (isset($_SESSION['admintoken']))
{
  if ($_SERVER['REQUEST_METHOD'] == 'POST')
  {
    updateReward($_POST);
    header("Location: adminlist.php?d=r&t=br");
  }
  else
  {
    print_info();
  }
}
else
  header("Location: adminlogin.php");
 function print_info()
   {	
	$type = $_GET["t"];
	$id = $_GET["account"];
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
				<?php
					if($type=="a")
						echo "Updating Account Number: " . $id;
					else
						echo "Updating Reward Number: " . $id;
				?>
			</div>
			<br/>
			<br/>
      <div class="infotable">
      <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
			<table border="0" class="info">

				<?php print_stuff($type, $id);?>

				
			</table>
			<br/>
			<table border="0">
			<tr><td>
			<input type="submit" value="Update" /></form>
			</td></tr>
			</table>
			</div>

			<br/>
			<table border="0"><tr>
				<td><form action="adminhome.php" method="get"><input type="submit" value="Home" /></form></td>
				<td><form action="adminlogout.php" method="get"><input type="submit" value="Log Out" /></form></td>
				</tr>
			</table>
			<br/>
		</div>
		
		</center>
	</body>
</html>
<?php
}

function print_stuff($type, $id){
	if($type=="a"){
    $account = getAccount($id);
    if (isset($account->{'account_num_a'}))
      $active = 'Y';
    else
      $active = 'N';

?>
		<tr>
    <td>First Name:</td><td><input type="text" name="first_name" size="25" value="<?php echo $account->{'first_name'}; ?>" /></td>
		</tr>
		<tr>
		<td>Last Name:</td><td><input type="text" name="last_name" size="25" value="<?php echo $account->{'last_name'}; ?>"/></td>
		</tr>
		<tr>
		<td>Zip:</td><td><select name="zip">
			<option value="ALL">All</option></td>
		</tr>
		<tr>
		<td>Gender:</td><td><input type="text" name="gender" size="25"value="<?php echo $account->{'gender'}; ?>" /></td>
		</tr>
		<tr>
		<td>Credit Score:</td><td><input type="text" name="credit_score" size="25" value="<?php echo $account->{'credit_score'}; ?>"/></td>
		</tr>
		<tr>
		<td>Account Status:</td><td><select name="status">
			<option value="active">Active</option>
			<option value="inactive">Inactive</option></td>
		</tr>
<?php
	}
	else {
    $reward = getReward($id);
    if (isset($reward->{'merch_id'}))
      $t = 'merch'; 
    else
      $t = 'sweep';

?>
    <input type="hidden" name="type" value="<?php echo $t; ?>"/>
		<input type="hidden" name="id" value="<?php echo $id; ?>"/>
    <tr>
    <td>Name:</td><td><input type="text" name="name" size="25" value="<?php echo $reward->{'name'}; ?>"/></td>
		</tr>
		<tr>
		<td>Cost:</td><td><input type="text" name="cost" size="25" /value="<?php echo $reward->{'cost'}; ?>"></td>
		</tr>
		<tr>
		<td>End Date (if Sweepstakes):</td><td><input type="text" name="end_date" size="25" /value="<?php echo $reward->{'end_date'}; ?>"></td>
		</tr>
		<tr>
		<td>Quantity (if Merchandise):</td><td><input type="text" name="quantity" size="25" /value="<?php echo $reward->{'quantity'}; ?>"></td>
		</tr>

<?php 
	}	
}
?>
