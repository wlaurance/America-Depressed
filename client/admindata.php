<?php
session_start();
require_once('lib/api.php');
if (isset($_SESSION['admintoken']))
{
  if ($_SERVER['REQUEST_METHOD'] == 'POST')
  {
    $data = processAdminRequest($_POST);
    print_data($data, $_POST);
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
   $zips = getAllZips();
   
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
			
			<h2>Please select one option from each section.</h2>
			<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
			<table border="1" class="info">
				<tr>
        		<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Gender</p>
        		<input type="radio" name="gender" value="M"> Male</input>
				<input type="radio" name="gender" value="F"> Female</input>
				<input type="radio" name="gender" value="ALL" checked> Both</input>
				</td>
        		<td rowspan="2"><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Function</p>        		
        		<p style="text-align:center; font-weight:bold;">Average</p>
        		<input type="radio" name="function" value="avg(balance)">Balance</input><br/>
        		<input type="radio" name="function" value="avg(credit_score)">Credit Score</input><br/>
        		<p style="text-align:center; font-weight:bold;">Maximum</p>
        		<input type="radio" name="function" value="max(balance)">Balance</input><br/>
        		<input type="radio" name="function" value="max(credit_score)">Credit Score</input><br/>
        		<p style="text-align:center; font-weight:bold;">Minimum</p>
        		<input type="radio" name="function" value="min(balance)">Balance</input><br/>
        		<input type="radio" name="function" value="min(credit_score)">Credit Score</input><br/>
        		<p style="text-align:center; font-weight:bold;">Other</p>
        		<input type="radio" name="function" value="sum(balance)">Total Debt</input><br/>
        		<input type="radio" name="function" value="count(account_num)">Number of Accounts
        			</input><br/>
        		</td>
				</tr>
				<tr>
        		<td><p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">Zip Code</p>
        		<center><select name="zip">
					<option value="ALL">All</option>
          <?php 
            foreach($zips as $zc)
            {
?>
            <option value="<?php echo $zc; ?>"><?php echo $zc; ?></option>
            <?php } ?>
				</select></center>
        		
        		<p style="font-size:large; text-align:center; font-weight:bold;">
        			---------------OR---------------</p>
        		<p style="font-size:large; text-align:center; font-weight:bold; 
        			text-decoration:underline;">State</p>
        		<table border="0" class="states">
        		<tr>
        		<td><input type="radio" name="state" value="VA">VA</input></td>
				<td><input type="radio" name="state" value="WV">WV</input></td>
				</tr>
				<tr>
				<td><input type="radio" name="state" value="NC">NC</input></td>
				<td><input type="radio" name="state" value="SC">SC</input></td>
				</tr>
				<tr>
				<td><input type="radio" name="state" value="MD">MD</input></td>
				<td><input type="radio" name="state" value="ALL" checked>All</input></td>
        		</tr>
        		</td>
				</tr>
				</table>
			</table> 
			<br/>
			<table border="0">
			<tr>
			<td><input type="submit" value="Submit" /></td>
			<td><input type="reset" value="Reset" /></td>
			</tr>
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
function print_data($data, $post)
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
			<?php 
			
			if(isset($post['function'])){
				if ($post['function']=="avg(balance)")
					echo "The Average Balance ";
				else if ($post['function']=="avg(credit_score)")
					echo "The Average Credit Score ";
				else if ($post['function']=="max(balance)")
					echo "The Maximum Balance ";
				else if ($post['function']=="max(credit_score)")
					echo "The Maximum Credit Score ";
				else if ($post['function']=="min(balance)")
					echo "The Minimum Balance ";
				else if ($post['function']=="min(credit_score)")
					echo "The Minimum Credit Score ";
				else if ($post['function']=="sum(balance)")			
					echo "The Total Debt ";
				else if ($post['function']=="count(account_num)")
					echo "The Number of Accounts ";
					
				if ($post['gender']=="M")
					echo "for Males ";
				else if ($post['gender']=="F")
					echo "for Females ";
				else if ($post['gender']=="ALL")
					echo "for Both Genders ";
				
				if ($post['state']=="VA")
					echo "in VA ";
				else if ($post['state']=="NC")
					echo "in NC ";
				else if ($post['state']=="SC")
					echo "in SC ";
				else if ($post['state']=="MD")
					echo "in MD ";
				else if ($post['state']=="WV")
					echo "in WV ";
					
				if ($post['zip'] != "ALL")
					echo "in " . $post['zip'] . " ";
					
				echo "is " . $data->{'results'};
				
			}
			else
				echo "Please choose a valid function.";
			?>
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
