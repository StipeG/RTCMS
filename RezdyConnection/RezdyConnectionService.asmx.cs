using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Services;
using System.Xml;

namespace RezdyConnection
{
    /// <summary>
    /// Summary description for RezdyConnectionService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    // [System.Web.Script.Services.ScriptService]
    public class RezdyConnectionService : System.Web.Services.WebService
    {

        public static string FlattenException(Exception exception)
        {
            var stringBuilder = new StringBuilder();

            while (exception != null)
            {
                stringBuilder.AppendLine(exception.Message);
                stringBuilder.AppendLine(exception.StackTrace);

                exception = exception.InnerException;
            }

            return stringBuilder.ToString();
        }

        [WebMethod]
        public XmlDocument RezdyQuery(string url, string verb)
        {
            if (String.IsNullOrEmpty(url))
                return null;
            XmlDocument doc = new XmlDocument();

            // Prepare web request...
            System.Net.HttpWebRequest myRequest = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
            myRequest.Method = verb;
            myRequest.ContentType = "application/xml;charset=\"utf-8\"";
            myRequest.Accept = "application/xml";

            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls | System.Net.SecurityProtocolType.Tls11 | System.Net.SecurityProtocolType.Tls12;
            //if (postData != null)
            //{
            //    // Wrap the request stream with a text-based writer
            //    StreamWriter writer = new StreamWriter(myRequest.GetRequestStream());
            //    // Write the XML text into the stream
            //    writer.WriteLine(postData.OuterXml);
            //    writer.Close();
            //}

            // Call the API
            try
            {
                System.Net.HttpWebResponse myResponse = (System.Net.HttpWebResponse)myRequest.GetResponse();
                StreamReader responseStream = new StreamReader(myResponse.GetResponseStream(), true);
                string responseText = responseStream.ReadToEnd();
                doc.LoadXml(responseText);
            }
            catch (System.Net.WebException e)
            {
                WriteToTxtFileErrorRezdy(e.Message, "Prvi error");
                if (e.InnerException != null && !String.IsNullOrEmpty(e.InnerException.Message))
                {
                    WriteToTxtFileErrorRezdy(FlattenException(e), "Prvi inner error");
                }
                try
                {

                    StreamReader responseStream = new StreamReader(e.Response.GetResponseStream(), true);
                    string responseText = responseStream.ReadToEnd();
                    doc.LoadXml(responseText);
                }
                catch (Exception e1)
                {
                    WriteToTxtFileErrorRezdy(e1.Message, "Drugi error");
                    return null;
                }
            }
            catch (Exception e)
            {
                WriteToTxtFileErrorRezdy(e.Message, "Treci error");
                return null;
                //doc.LoadXml("<response><error></error></response>");
            }
            return doc;
        }

        [WebMethod]
        public XmlDocument TourCMSQuery(string path, int channelId, string verb, string _baseUrl, int MerchantID, 
            string PrivateKey)
        {
            if (String.IsNullOrEmpty(path))
                return null;

            string url = _baseUrl + path;
            DateTime outboundTime = DateTime.Now.ToUniversalTime();
            string signature = GenerateSignature(path, verb, channelId, outboundTime,PrivateKey, MerchantID);
            XmlDocument doc = new XmlDocument();

            // Prepare web request...
            System.Net.HttpWebRequest myRequest = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
            myRequest.Method = verb;
            myRequest.ContentType = "text/xml;charset=\"utf-8\"";
            myRequest.Headers.Add("Authorization", "TourCMS " + channelId + ":" + MerchantID + ":" + signature);
            myRequest.Headers.Add("x-tourcms-date", outboundTime.ToString("r"));
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls | System.Net.SecurityProtocolType.Tls11 | System.Net.SecurityProtocolType.Tls12;
            // Call the API
            try
            {
                System.Net.HttpWebResponse myResponse = (System.Net.HttpWebResponse)myRequest.GetResponse();
                StreamReader responseStream = new StreamReader(myResponse.GetResponseStream(), true);
                string responseText = responseStream.ReadToEnd();
                doc.LoadXml(responseText);
            }
            catch (System.Net.WebException e)
            {
                WriteToTxtFileErrorRezdy(e.Message, "Prvi error");
                if (e.InnerException != null && !String.IsNullOrEmpty(e.InnerException.Message))
                {
                    WriteToTxtFileErrorTourCMS(FlattenException(e), "Prvi inner error");
                }
                try
                {

                    StreamReader responseStream = new StreamReader(e.Response.GetResponseStream(), true);
                    string responseText = responseStream.ReadToEnd();
                    doc.LoadXml(responseText);
                }
                catch (Exception e1)
                {
                    WriteToTxtFileErrorTourCMS(e1.Message, "Drugi error");
                    return null;
                }
            }
            catch (Exception e)
            {
                WriteToTxtFileErrorTourCMS(e.Message, "Treci error");
                return null;
                //doc.LoadXml("<response><error></error></response>");
            }
            return doc;
        }

        protected string GenerateSignature(string path, string verb, int channelId, DateTime outboundTime, string _privateKey, int _marketplaceId)
        {
            string stringToSign = "";
            string signature = "";
            string outboundStamp = DateTimeToStamp(outboundTime).ToString();

            // Build the basic string that gets signed
            stringToSign = channelId + "/" + _marketplaceId + "/" + verb + "/" + outboundStamp + path;
            stringToSign = stringToSign.Trim();

            // Sign with private API Key
            var hmacsha256 = new System.Security.Cryptography.HMACSHA256(Encoding.UTF8.GetBytes(_privateKey));
            hmacsha256.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
            signature = Convert.ToBase64String(hmacsha256.Hash);
            signature = HttpUtility.UrlEncode(signature);

            return signature;
        }
        protected int DateTimeToStamp(DateTime value)
        {
            TimeSpan span = (value - new DateTime(1970, 1, 1, 0, 0, 0, 0));
            return (int)span.TotalSeconds;
        }

        private void WriteToTxtFileErrorRezdy(string error, string err_name)
        {
            String date = DateTime.Now.ToString("d");
            string name = "Rezdy - " + date + "-Error";
            string str = System.IO.Path.GetDirectoryName(
                System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase);
            str = str.Remove(0, 6);
            System.IO.StreamWriter file = new System.IO.StreamWriter(str + "\\" + name + ".txt", true);
            file.WriteLine("Rezdy Error" + "\r\n");
            file.WriteLine("Error: " + err_name + " " + "\r\n");
            file.WriteLine(error + "\r\n");

            file.Close();

        }
        private void WriteToTxtFileErrorTourCMS(string error, string err_name)
        {
            String date = DateTime.Now.ToString("d");
            string name = "TourCMS - " + date + "-Error";
            string str = System.IO.Path.GetDirectoryName(
                System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase);
            str = str.Remove(0, 6);
            System.IO.StreamWriter file = new System.IO.StreamWriter(str + "\\" + name + ".txt", true);
            file.WriteLine("TourCMS Error" + "\r\n");
            file.WriteLine("Error: " + err_name + " " + "\r\n");
            file.WriteLine(error + "\r\n");

            file.Close();

        }
    }
}
