<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use App\Service\WeatherService;
use \Exception;

class WeatherController extends AbstractController
{

    private $weatherService;

    public function __construct(WeatherService $weather)
    {
        $this->weatherService = $weather;

    }

    /**
     * @Route("/weather/{id}", name="weather", defaults={"id"="2972315"})
     * @Method({"GET", "POST"})
     */
    public function index($id)
    {

        $weather = $this->weatherService->getWeather($id);
        if($weather instanceof Exception){
            return $this->render('weather/error.html.twig', array(
                'exception' => $weather,
            ));
        }else{
            return $this->render('weather/index.html.twig', array(
                'weather' => $weather
            ));
        }
    }

    /**
     * @Route("/{lat}/{lon}", name="coord_weather")
     * @Method({"GET", "POST"})
     */
    public function getByCoordinates($lat, $lon)
    {
        $weatherId = $this->weatherService->getWeatherByCoordinates($lat, $lon);
        if($weatherId instanceof Exception){
            return $this->render('weather/error.html.twig', array(
                'exception' => $weatherId
            ));
        }else{
            return $this->redirectToRoute('weather', array(
                'id' => $weatherId
            ));
        }
    }

}