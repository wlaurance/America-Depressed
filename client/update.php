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
      		Updating Account Information for <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>.
			</div>
			<br/>
			<br/>
			<div class="payment">
			<table border="0" class="info">
				<tr>
        		<td>First Name:</td><td><input type="text" name="first_name" size="25" /></td>
				</tr>
				<tr>
        		<td>Last Name:</td><td><input type="text" name="last_name" size="25" /></td>
				</tr>
				<tr>
        		<td>Zip:</td><td><input type="text" name="zip" size="25" /></td>
				</tr>
			</table> 
			<table border="0">
			<tr><td>
			<form action="updatemade.php" method="get"><input type="submit" value="Update" /></form>
			</td></tr>
			</table>
			</div>
		<br/>	
		<br/>
		</div>
		
		</center>
	</body>
</html>
