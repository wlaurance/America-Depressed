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
      Welcome, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>!
			</div>
			<br/>
			<br/>
			<div class="infotable">
			
			<h2>Please select from the following options.</h2>
			
			<table border="0" class="info">
				<tr>
        		<td>Options for Gender</td>
        		<td rowspan="0">Options for Function</td>
				</tr>
				<tr>
        		<td>Options for Zip</td>
				</tr>
				<tr>
        		<td>Options for State</td>
				</tr>
			</table> 
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
