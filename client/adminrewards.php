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
			
			<h2>What would you like to do?</h2>
			
			<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
			<table border="0" class="info">
				<tr>
        		<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">List Rewards</p></td>
				</tr>
				<tr>
        		<td><center><input type="radio" name="rewards" value="sweep">Sweepstakes</input>
				<input type="radio" name="rewards" value="merch">Merchandise</input>
				<input type="radio" name="rewards" value="ALL" checked> All</input></center></td>
				</tr>
				<tr><td><center><input type="submit" value="Submit" /></center></td></tr>
			</table>
			</form>
			
			<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
			<table border="0" class="info">
				<tr>
				<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Create a Reward</p></td>
        		</tr>
				<tr><td><center><input type="submit" value="Create" /></center></td></tr>
			</table>
			</form>
			
			<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
			<table border="0" class="info">
				<tr>
				<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Update a Reward</p></td>
        		</tr>
        		<tr><td>Reward Number: <input type="text" name="reward_num" size="25" /></td>
        		</tr>
				<tr><td><center><input type="submit" value="Update" /></center></td></tr>
			</table>
			</form>
			
			</div>
			<br/>
			<table border="0">
			<tr>
			<td><form action="adminhome.php" method="get"><input type="submit" value="Home" /></form></td>
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
