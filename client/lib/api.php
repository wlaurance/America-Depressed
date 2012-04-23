<?php

$url = 'http://bg6:8000';

function encodeparams($post)
{
  foreach($post as $key => $value)
  {
    $post[$key] = urlencode($value);
  }

  return $post;
}


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

function getProfile()
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

function updateAccountInfo($post)
{
  global $url;
  $route = $url . '/profile/update';
  $post =  encodeparams($post);
  $route = $route ."?sessionid={$_SESSION['token']}&fn={$post['first_name']}&ln={$post['last_name']}&zip={$post['zip']}";
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
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
  $post = encodeparams($post);
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
  $post = encodeparams($post);
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid=" . $_SESSION['token']. "&date='".$post['date']."'&accountnumber='". $post['accountnumber']."'&amount=".$post['amount']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);

}

function getRewardAccount()
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

function redeemReward($reward, $acct_id)
{
  global $url;
  $route = $url . '/rewards/redeem';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid=" . $_SESSION['token'] . "&type=".$reward['type']."&id=". $reward["id"]."&acct_id=".$acct_id);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);
}

function getRewardsEarned($acct_id)
{
  global $url;
  $route = $url . '/rewards/redeemed';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid=" . $_SESSION['token']."&acct_id=".$acct_id);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  return json_decode($result);
}
//Admin functions
function adminlogin($username, $password)
{
  global $url;
  $route = $url . '/admin';
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
    $_SESSION['admintoken'] = $sessionid->{'admintoken'};
    $_SESSION['adminname'] = $username;
  }
}

function adminlogout()
{
  global $url;
  $route = $url . '/admin/logout';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route . '?sessionid=' . $_SESSION['admintoken']);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  unset($_SESSION['adminname']);
  unset($_SESSION['admintoken']);
  return json_decode($result);
}

function getAllZips()
{
  global $url;
  $route = $url . '/admin/zip';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  $z = json_decode($result);
  return $z->{'zip'};
}

function processAdminRequest($post)
{
  $post = encodeparams($post);
  $zip = $post['zip'];
  $gender = $post['gender'];
  $state = $post['state'];
  $function  = $post['function'];
  global $url;
  $route = $url . '/admin/function';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $route);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "sessionid={$_SESSION['admintoken']}&zip={$zip}&gender={$gender}&state={$state}&function={$function}");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $result = curl_exec($ch);
  curl_close($ch);
  $z = json_decode($result);
  return $z;
}


?>
