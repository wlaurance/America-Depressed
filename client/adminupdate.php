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
  print_info();
else
  header("Location: adminlogin.php");
 function print_info()
   {	
	$type = $_GET["t"];
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
						echo "Updating Account Number: 4264237891688888825791";
					else
						echo "Updating Reward Number: 738591327510";
				?>
			</div>
			<br/>
			<br/>
			<div class="infotable">
			<table border="0" class="info">

				<?php print_stuff($type);?>

				
			</table>
			<br/>
			<table border="0">
			<tr><td>
			<form><input type="submit" value="Update" /></form>
			</td></tr>
			</table>
			</div>

			<br/>
			<table border="0"><tr>
				<td><form action="adminhome.php" method="get"><input type="submit" value="Home" /></form></td>
				<td><form action="logout.php" method="get"><input type="submit" value="Log Out" /></form></td>
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
?>
		<tr>
		<td>First Name:</td><td><input type="text" name="first_name" size="25" /></td>
		</tr>
		<tr>
		<td>Last Name:</td><td><input type="text" name="last_name" size="25" /></td>
		</tr>
		<tr>
		<td>Zip:</td><td><select name="zip">
			<option value="ALL">All</option></td>
		</tr>
		<tr>
		<td>Gender:</td><td><input type="text" name="gender" size="25" /></td>
		</tr>
		<tr>
		<td>Credit Score:</td><td><input type="text" name="credit_score" size="25" /></td>
		</tr>
		<tr>
		<td>Account Status:</td><td><select name="status">
			<option value="active">Active</option>
			<option value="inactive">Inactive</option></td>
		</tr>
<?php
	}
	else {
?>
		<tr>
		<td>Name:</td><td><input type="text" name="name" size="25" /></td>
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
