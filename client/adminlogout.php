<?php 
session_start();
require_once('lib/api.php');
adminlogout();
header("Location: adminlogin.php");
?>
