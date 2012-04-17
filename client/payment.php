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
				Your current balance is: $2500000000000000
			<br/>
			<br/>
			     <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
					Payment Date : <input type="text" name="payment_date" size="25" /><br />
					Amount to Pay: <input type="text" name="payment_amount" size="25" /><br />
					<p><input type="submit" value="Make Payment" /><input type="reset" value="Clear" />
					</p>
        		</form>
			</div>
			<br/>
			<br/>
			
			
		</center>
	</body>
</html>
