 <header class="header-one" >
            <!-- Start top bar -->
            <div class="topbar-area fix hidden-xs">
                <div class="container">
                    <div class="row">
                       <div class="col-md-8 col-sm-8">
                           <div class="topbar-left">
                                <ul> 
                                     <li><a href="?page=home"> <font color="<?php echo $colortop1;?>"><?php if ($langweb == "thai") {
    echo $nameweb;
} elseif ($langweb == "english") {
    echo $namewebeng;
}?></font></a></li>
                                    <li><a href="mailto:<?php echo $email;?>"><font color="<?php echo $colortop1;?>"><i class="fa fa-envelope" ></i> <?php echo $email;?></font></a></li>
                                    <li><a href="tel:<?php echo $tell;?>"><font color="<?php echo $colortop1;?>"><i class="fa fa-phone"></i> <?php echo $tell;?></font></a></li>
                                </ul>
							</div>
                        </div>
                        <div class=" col-md-4 col-sm-4">
                            <div class="topbar-right">
                                <div class="top-social">
                                    <ul>
                                        <li><font color="<?php echo $colortop1;?>">Follow Us</font></li>
                                        <li><a href="<?php echo $tiktok;?>"><font color="<?php echo $colortop1;?>"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
</svg></font></a></li>
                                        <li><a href="<?php echo $facebook;?>"><font color="<?php echo $colortop1;?>"><i class="fa fa-facebook"></i></font></a></li>
                                        <li><a href="<?php echo $youtube;?>"><font color="<?php echo $colortop1;?>"><i class="fa fa-youtube"></i></font></a></li>
                                         <li >
        <a href="?page=<?php echo $strpage;?>&lang=thai" >
            <img src="../img/ธงชาติไทย.png" alt="ภาษาไทย" width="100">
        </a>
    </li>
    <li >
        <a href="?page=<?php echo $strpage;?>&lang=english" >
            <img src="../img/Flag_of_the_United_Kingdom.png" alt="English" width="100">
        </a>
    </li>
                                    </ul> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
                
            </div>
            <!-- End top bar -->
            <!-- header-area start -->
            <div id="sticker" class="header-area header-area-2 hidden-xs">
                <div class="<?php 
                if ($menutopwight == "0") {
  echo "container";
} else {
  echo "container-fluid";
}
                ?>">
                    <div class="row">
                       
                            <div class="row">
                                <!-- logo start -->
                              
                                <div class="col-md-12 col-sm-12">
                                   
                                    
                                    <!-- mainmenu start -->
                                    <nav class="navbar navbar-default">
                                        <div class="collapse navbar-collapse" id="navbar-example">
                                            <div class="main-menu">
                                                <ul class="nav navbar-nav navbar-start">
<li  onclick="document.location='?page=home'">
        <div class="logo" style="margin-top: 10px; margin-bottom: 10px;" >  
          <img src="../img/<?php echo $logo;?>" alt=""   style="height:60px; width:;"></div>
</li>
<li></li>
<?php
	ini_set('display_errors', 1);
	error_reporting(~0);


	$sql = "SELECT * FROM menuwebsite WHERE codelist = '".$HTTP_HOST."' and showtop = '1' ";

	$query = mysqli_query($conn,$sql);

?>

<?php
while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
?>
<?php $idmunu=$result["id"];?>
<?php $linkdata=$result["linkdata"];?>  
<?php $linkater=$result["linkater"];?>
<?php if ($langweb == "thai") {
     $namemunu = $result["namemunuthai"];
} elseif ($langweb == "english") {
     $namemunu = $result["namemunueng"];
}


if ($linkater == "1") {
 $linkdatas = "$linkdata";
} else {
 $linkdatas = "?page=details&data=$linkdata";
}

?>

<?php
if ($result["typemenu"] == "0") {
  echo "<li><a href='$linkdatas'>$namemunu</a></li>";
} else {
    $idmunu=$result["id"];
    include("sulution/submenu.php");

}
?>


<?php
}
?>

                                                  
                                                </ul>
                                            </div>
                                        </div>
                                    </nav>
                                    <!-- mainmenu end -->
                       
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <!-- header-area end -->
            <!-- mobile-menu-area start -->
            <div class="mobile-menu-area hidden-lg hidden-md hidden-sm">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12"> 
                            <div class="mobile-menu"> 
                                <div class="logo" onclick="document.location='?page=home'">
                                       <img src="../img/<?php echo $logo;?>" alt=""   style="height:50px; width:;"> 
                                </div>
                                
                                <nav id="dropdown">
                                    <ul>
                                      <?php
	ini_set('display_errors', 1);
	error_reporting(~0);


	$sql = "SELECT * FROM menuwebsite WHERE codelist = '".$HTTP_HOST."' and showtop = '1' ";

	$query = mysqli_query($conn,$sql);

?>

<?php
while($result=mysqli_fetch_array($query,MYSQLI_ASSOC))
{
?>
<?php $idmunu=$result["id"];?>
<?php $linkdata=$result["linkdata"];?>  
<?php $linkater=$result["linkater"];?>
<?php if ($langweb == "thai") {
     $namemunu = $result["namemunuthai"];
} elseif ($langweb == "english") {
     $namemunu = $result["namemunueng"];
}


if ($linkater == "1") {
 $linkdatas = "$linkdata";
} else {
 $linkdatas = "?page=details&data=$linkdata";
}

?>

<?php
if ($result["typemenu"] == "0") {
  echo "<li><a href='$linkdatas'>$namemunu</a></li>";
} else {
    $idmunu=$result["id"];
    include("sulution/submenu.php");

}
?>


<?php
}
?>
 <li >
        <a href="?page=<?php echo $strpage;?>&lang=thai" >
            <img src="../img/ธงชาติไทย.png" alt="ภาษาไทย" style="height:20px; width:35px;"> 
            <?php if ($langweb == "thai") {
    echo "ภาษาไทย";
} elseif ($langweb == "english") {
    echo "Thai language";
}?>
        </a>
    </li>
    <li >
        <a href="?page=<?php echo $strpage;?>&lang=english" >
            <img src="../img/Flag_of_the_United_Kingdom.png" alt="English" style="height:20px; width:;">
             <?php if ($langweb == "thai") {
     echo "ภาษาอังกฤษ";
} elseif ($langweb == "english") {
       echo "English language";
}?>
        </a>
    </li>
                                                
                                    </ul>
                                </nav>
                            </div>					
                        </div>
                    </div>
                </div>
            </div>
            <!-- mobile-menu-area end -->		
                            
        </header>

                <!-- header end -->