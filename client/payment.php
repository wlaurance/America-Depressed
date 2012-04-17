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
     		Welcome, <?php echo $profile->{'first_name'} . ' ' . $profile->{'last_name'};?>!
			</div>
			<br/>
			<br/>
			<div class="payment">
				Make a Payment on Your Account
				<br/>
				<br/>
				Your account number is: 1111111111111111
				<br/>
				Your account balance is: $15959
			<br/>
			<br/>
			<form action="madepayment.php" method="post">
			<table border="0" class="info">
				<tr>
        		<td>Payment Date:</td><td><input type="text" name="charge_date" size="25" /></td>
				</tr>
				<tr>
        		<td>Amount:</td><td><input type="text" name="amount" size="25" /></td>
				</tr>
				<tr></tr>
				<tr></tr>
				<tr></tr>
				<tr>
				<td><input type="submit" value="Make Payment"/></td>
				<td><input type="reset" value="Clear"/></td>
				</tr>

			</table>
			</form>
			</div>
			<br/>
			<br/>
			
		</div>
		</center>
	</body>
</html>
