<?php
session_start();
require_once('lib/api.php');
if (isset($_SESSION['token']))
{
  if ($_SERVER['REQUEST_METHOD'] == 'POST')
  {
    updateAccountInfo($_POST);
    header("Location: acctinfo.php");
  }
  else 
  {
    print_info();
  }
}
else
  header("Location: login.php");
 function print_info()
   {
     $profile = getProfile();
     $profile = $profile->{'profile'};
     $account = account();
     $account = $account->{'account'};
     $reward = getRewardAccount();
     $reward = $reward->{'rewards_account'};
     $zips = getAllZips();
?>
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
      <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
			<table border="0" class="info">
				<tr>
        		<td>First Name:</td><td><input type="text" name="first_name" size="25" /></td>
				</tr>
				<tr>
        		<td>Last Name:</td><td><input type="text" name="last_name" size="25" /></td>
				</tr>
				<tr>
        		<td>Zip:</td><td><select name="zip">
            <?php 
      foreach($zips as $zip){ ?>
      <option value="<?php echo $zip;?>" 
        <?php if ($zip == $account->{'zip'}){
          echo 'selected="selected"';
          }
         ?>
        >
      <?php echo $zip; ?></option>
    <?php } ?>
           </td> 
          </select>
				</tr>
			</table> 
			<table border="0">
			<tr><td>
		<input type="submit" value="Update" /></form>
			</td></tr>
			</table>
			</div>
		<br/>	
		<table border="0">
			<td><form action="acctinfo.php" method="get"><input type="submit" value="Home" /></form></td>
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
