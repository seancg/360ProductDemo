<?php

$to = "Carl.Hansen@atplearning.com";
// $to = "Sean.Grant@atplearning.com";
// $to = "seancg@gmail.com";
$subject = "Contact Us Message Sent from ATP Learning Solutions";

$name = filter_var($_POST['name']);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$phone = filter_var($_POST['phone']);
$usrSubject = filter_var($_POST['subject']);
$usrMessage = filter_var($_POST['message']);


$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";

// Additl' headers

$headers .= "From: " . "no-reply@atplearningsolutions.com" . "\r\n";
$headers .= "Reply-To: " . "no-reply@atplearningsolutions.com" . "\r\n";

$message = "<p>Hello,</p>";
$message .= "<p>Someone has submitted a message via the <b>ATP Learning Solutions</b> website (http://www.atplearningsolutions.com/360ProductDemo/). Please ensure a response is sent within 24 business hours.</p>";
$message .= "<p>Message details:</p>";
$message .= "<p>Name: " . $name . "<br />"
        . "Email: " . $email ."<br />"
        . "Phone: " . $phone ."<br /><br />"
        . "Subject: " . $usrSubject . "<br />"
        . "Message: " . $usrMessage . "</p>";

mail($to, $subject, $message, $headers);

echo("To: " . $to);
echo("<br />Subject: " . $subject);
echo("<br />Headers: " . $headers);
echo("<br />Message: " . $message);