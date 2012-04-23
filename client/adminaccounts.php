<?php
//for listing info:
//d refers to the type of request: a = accounts, r = rewards
//t refers to the type of data: a = active, i = inactive, ba = both accounts, m = mech, s = sweep, 
//br = both rewards

//for creating accounts/rewards:
//t refers to the type to add: a=account, r=rewards

session_start();
require_once('lib/api.php');
if (isset($_SESSION['admintoken']))
  print_info();
else
  header("Location: adminlogin.php");
 function print_info()
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
      Welcome, Admin <?php echo $_SESSION['adminname']; ?>!
			</div>
			<br/>
			<br/>
			<div class="infotable">
			<input type="hidden" name="d" value="a">
			<h2>What would you like to do?</h2>
			
			<form action="adminlist.php" method="GET">

			<table border="0" class="info">
				<tr>
        		<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">List Accounts</p></td>
				</tr>
				<tr>
        		<td><center><input type="radio" name="t" value="a">Active</input>
				<input type="radio" name="t" value="i"> Inactive</input>
				<input type="radio" name="t" value="ba" checked> All</input></center></td>
				</tr>
				<tr><td><center><input type="submit" value="Submit" /></center></td></tr>
			</table>
			</form>
			
			<form action="adminadd.php?" method="GET">
			<input type="hidden" name="t" value="a">
			<table border="0" class="info">
				<tr>
				<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Create an Account</p></td>
        		</tr>
				<tr><td><center><input type="submit" value="Create" /></center></td></tr>
			</table>
			</form>
			
			<form action="adminupdate.php" method="GET">
			<input type="hidden" name="t" value="a">
			<table border="0" class="info">
				<tr>
				<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Update an Account</p></td>
        		</tr>
        		<tr><td>Account Number: <input type="text" name="account" size="25" /></td>
        		</tr>
				<tr><td><center><input type="submit" value="Update" /></center></td></tr>
			</table>
			</form>
			
			<form action="adminlist.php" method="GET">
			<input type="hidden" name="d" value="a">
			<input type="hidden" name="t" value="a">
			<table border="0" class="info">
				<tr>
				<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Charge Interest to Accounts</p></td>
        		</tr>
				<tr><td><center><input type="submit" value="Charge" /></center></td></tr>
			</table>
			</form>
			
			</div>
			<br/>
			<table border="0">
			<tr>
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
?>
