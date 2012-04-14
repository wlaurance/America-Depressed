<?php 
session_start();
require_once('lib/api.php');
logout();
header("Location: login.php");
?>
