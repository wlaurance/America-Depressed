<?php
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
			
			<table border="0" class="info">
				<tr>
        <td><center><a href="admindata.php">Data</a></center></td><td><p style="text-align:left;" >Compute functions on the database, including: max, min, ave, count, sum.  Limit data based on demographic conditions.</p></td>
				</tr>
				<tr>
        <td><center><a href="adminaccounts.php">Accounts</a></center></td><td><p style="text-align:left;" >List, create, and update accounts.  Charge interest to each account.</p></td>
				</tr>
				<tr>
        <td><center><a href="adminrewards.php">Rewards</a></center></td><td><p style="text-align:left;" >List, create, and update rewards.</p></td>
				</tr>
			</table> 
			</div>
			<br/>
			<table border="0">
			<tr>
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
