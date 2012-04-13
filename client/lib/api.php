<?php

$url = 'http://bg6:8000';
echo getTime();
echo login('wlaurance', 'password123');
function getTime() 
{
  global $url;
  $route = $url . '/time';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  $time = json_decode($result);
  return $time->{'hello'};
}

function login($username, $password)
{
  global $url;
  $route = $url . '/login';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "username={$username}&password={$password}");
  $result = curl_exec($ch);
  curl_close($ch);
  $sessionid = json_decode($result);
  return $sessionid->{'token'};
}
?>
