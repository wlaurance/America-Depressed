<?php

$url = 'http://bg6:8000';
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
  if (isset($sessionid->{'error_message'}))
    return $sessionid;
  else {
    $_SESSION['token'] = $sessionid->{'token'};
    return getProfile($username);
  }
}

function getProfile($username)
{
  global $url;
  $route = $url . '/profile';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route . '?sessionid=' . $_SESSION['token']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);
}

function logout()
{
  global $url;
  $route = $url . '/profile/logout';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route . '?sessionid=' . $_SESSION['token']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  unset($_SESSION['token']);
  return json_decode($result);
}

function account()
{
  global $url;
  $route = $url . '/account';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, 'sessionid=' . $_SESSION['token']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);
}

function makeCharge($post)
{
  global $url;
  $route = $url . '/account/charge';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid=" . $_SESSION['token']. "&date='".$post['date']."'&accountnumber='". $post['accountnumber']."'&amount=".$post['amount']."&location='".$post['location']."'");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);

}

function makePayment($post)
{
  global $url;
  $route = $url . '/account/payment';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid=" . $_SESSION['token']. "&date='".$post['date']."'&accountnumber='". $post['accountnumber']."'&amount=".$post['amount']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);

}

function getRewardAccount($post)
{
  global $url;
  $route = $url . '/rewards/account';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid=" . $_SESSION['token']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);

}

function getRewards($type, $upper)
{
  global $url;
  $route = $url . '/rewards/range';
  if ($type == 'm')
    $type = 'merch';
  else
    $type = 'sweep';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route . "?sessionid=" . $_SESSION['token'] . "&upper=" .$upper . "&type=". $type);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);
}


?>
