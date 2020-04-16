<?php

function cplxMult($w, $z)
{
    return array( $w[0] * $z[0] - $w[1] * $z[1],  $w[0] * $z[1] + $w[1] * $z[0]);
}

function cplxSum($w, $z)
{
    return array( $w[0] + $z[0], $w[1] + $z[1]);
}

function cplxConj($z)
{
    return array( $z[0], - $z[1]);
}

function getPath($c,$N) {
    $dt = 1/$N;
    $points = array();
    
    for ($i = 0; $i <= $N; $i++) {
        array_push($points, getPoint($c, $i*$dt));
    }

    return $points;
}

function getPoint($c,$t) {
    global $Cos;
    $z = array($Cos($t), $Cos(.25 - $t));
    $p = array(0,0);

    $p = cplxSum($p, cplxMult($c[4],$z));
    $p = cplxSum($p, cplxMult($c[2],cplxConj($z)));

    $z = array($Cos(2*$t), $Cos(.25 - 2*$t));
    $p = cplxSum($p, cplxMult($c[5],$z));
    $p = cplxSum($p, cplxMult($c[1],cplxConj($z)));
    
    $z = array($Cos(3*$t), $Cos(.25 - 3*$t));
    $p = cplxSum($p, cplxMult($c[6],$z));
    $p = cplxSum($p, cplxMult($c[0],cplxConj($z)));

    $p[0] *= 20;
    $p[1] *= 20;
    return implode(" ",$p);
}

function circleCos($t) {
    return cos($t*2*M_PI);
}

function squareCos($t) {
    $t -= floor($t);
    return min(1, max(-1, abs(8*$t - 4) - 2));
}



try {
    $date = new DateTime($_SERVER['QUERY_STRING']);
} catch (Exception $e) {
    $date = new DateTime();
}

$dayCount = array(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334);

$m = $date->format('m');
$d = $dayCount[(int)$m-1] + (int) $date->format('d') - 1;
if ($m > 1) {
   $y = $date->format('YY');
   if ($y % 4 == 0) {
      if ($y % 100 != 0 || $y % 400 == 0) {
      	 $d += 1;
      }
   }
}

$h = (int) $date->format('H');
$s = ( (int) $date->format('i')) * 6 +  floor ( (int) $date->format('s') / 10 );

if ($s % 4 == 0 or $s % 4 == 3) {
    $Cos = 'squareCos';
} else {
    $Cos = 'circleCos';
}


$s -= ($s % 2);
$s += floor($h/12);
$h %= 12;

$s *= 127;
$d += floor($s/361);
$d *= 127;
$s %= 361;
$d %= 361;

$pts = array(
    array(1,0),
    array(3,0),
    array(2,1),
    array(1,2),
    array(2,2),
    array(0,1),
    array(0,3),
    array(1,2),
    array(2,1),
    array(2,2),
    array(-1,-0),
    array(-3,-0),
    array(-2,-1),
    array(-1,-2),
    array(-2,-2),
    array(-0,-1),
    array(-0,-3),
    array(-1,-2),
    array(-2,-1)
);

$c = array();
$c[0] = $pts[$d % 19];
$c[1] = $pts[$s % 19];
$c[2] = array(floor($h/4) - 1, ($h/2) %2 );
$c[3] = array(0,0);
$c[4] = array(1, $h % 2);
$c[5] = $pts[floor($s / 19)];
$c[6] = $pts[floor($d / 19)];

$c[2] = cplxMult($c[2], $c[4]);

$path = getPath($c, 500);

?>

<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" preserveAspectRatio="xMidYMin meet" width="100%" height="100%">
<path stroke="#222" fill="none" stroke-width="2"
transform="translate(250 250)" d="M 
<?php
echo implode(" L ", $path);
?>
 Z"/>
<text x="250" y="16" font-size="16" text-anchor="middle">
<?php
                echo $date->format('Y-m-d H:i:s');
?>
</text>
</svg>
