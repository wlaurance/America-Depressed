<?php
	//same idea here to save files...
	//t refers to type to add: a=account, r=reward
	
	//also, can you make it do a "Thank you for adding Account/Reward Number: 623472361590" message when 
	//you click create? like the redeem rewards stuff :D

	//when a new account is added, the interest rate is based on the credit score. I will have to get 
	//you the algorithm that I used to get the interest rates.
	//also, the account number needs to be generated with that program that we used. or reward number 
	//needs to be calculated based on what type it is.
	//add with a balance of 0 for acct balance and reward points balance
	
	//as far as error checking goes:
	//make sure unique ssn and reward acct number

session_start();
require_once('lib/api.php');
if (isset($_SESSION['admintoken']))
{
  if($_SERVER['REQUEST_METHOD'] == 'POST')
  {
    if ($_POST['type'] == 'account'){
      $msg = createAccount($_POST);
      if (isset($msg->{'error_message'}))
        print_info("a", $msg->{'error_message'});
      else
        header("Location: adminlist.php?d=a&br");
    }
    else {
      createReward($_POST);
      header("Location: adminlist.php?d=r&t=br");
    }
  }
  else
  {
	  $type = $_GET["t"];
    print_info($type);
  }
}
else
  header("Location: adminlogin.php");
 function print_info($type, $err = '')
   {	
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
						echo "Creating a New Account";
					else
						echo "Creating a New Reward";
				?>
			</div>
			<br/>
			<br/>
			<div class="infotable">
			<table border="0" class="info">
      <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
				<?php print_stuff($type);?>

        <?php if ($err != '') echo '<b>'. $err . '</b>'; ?>
			</table> 
			<br/>
			<table border="0">
			<tr><td>
			<input type="submit" value="Create" /></form>
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

function print_stuff($type){
  if($type=="a"){
    $zips = getAllZips();
?>
    <input type="hidden" value="account" name="type"/>
		<tr>
		<td>First Name:</td><td><input type="text" name="first_name" size="25" /></td>
		</tr>
		<tr>
		<td>Last Name:</td><td><input type="text" name="last_name" size="25" /></td>
		</tr>
		<tr>
    <td>Zip:</td><td><select name="zip">
<?php 
    foreach($zips as $z){
?>
  <option value="<?php echo $z; ?>"><?php echo $z; ?></option>
<?php }
?>
    </select>
    </td>
		</tr>
		<tr>
		<td>Gender:</td><td><input type="text" name="gender" size="25" /></td>
		</tr>
		<tr>
		<td>SSN:</td><td><input type="text" name="ssn" size="25" /></td>
		</tr>
		<tr>
		<td>Credit Score:</td><td><input type="text" name="credit_score" size="25" /></td>
		</tr>

<?php
	}
	else {
?>
		<tr>
		<td>Name:</td><td><input type="text" name="name" size="25" /></td>
		</tr>
		<tr>
		<td>Type:</td><td><select name="type">
			<option value="sweep">Sweepstakes</option>
			<option value="merch">Merchandise</option></td>
		</tr>
		<tr>
		<td>Cost:</td><td><input type="text" name="cost" size="25" /></td>
		</tr>
		<tr>
		<td>End Date (if Sweepstakes):</td><td><input type="text" name="end_date" size="25" /></td>
		</tr>
		<tr>
		<td>Quantity (if Merchandise):</td><td><input type="text" name="quantity" size="25" /></td>
		</tr>

<?php 
	}	
}
?>
