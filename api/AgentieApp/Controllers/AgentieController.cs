using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;

namespace AgentieApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgentieController : ControllerBase
    {
        private IConfiguration _configuration;
        public AgentieController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        [HttpGet]
        [Route("GetNumeModel")]
        public JsonResult GetNumeModel()
        {
            string query = "select Nume, Prenume, Oras, Telefon, Mail from dbo.Fotomodele";
            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult(table);
        }

        [HttpGet]
        [Route("GetUserClient")]
        public JsonResult GetUserClient()
        {
            string query = "select Mail from dbo.Clienti";
            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult(table);
        }

        [HttpGet]
        [Route("GetParolaClient")]
        public JsonResult GetParolaClient()
        {
            string query = "select Parola from dbo.Clienti";
            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult(table);
        }
        
        [HttpPost]
        [Route("Register")]
        public IActionResult Register([FromBody] UserCredentials userCredentials)
        {
            string query = "INSERT INTO dbo.Clienti (Nume,Telefon,Mail, Parola) VALUES (@Nume, @Telefon, @Mail, @Parola)";
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                try
                {
                    myCon.Open();
                    using (SqlCommand myCommand = new SqlCommand(query, myCon))
                    {
                        myCommand.Parameters.AddWithValue("@Nume", userCredentials.Nume);
                        myCommand.Parameters.AddWithValue("@Telefon", userCredentials.Telefon);
                        myCommand.Parameters.AddWithValue("@Mail", userCredentials.Mail);
                        myCommand.Parameters.AddWithValue("@Parola", userCredentials.Parola);

                        myCommand.ExecuteNonQuery();
                    }
                    return Ok(new { message = "User registered successfully." });
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = $"Error: {ex.Message}" });
                }
            }
        }

        [HttpDelete]
        [Route("DeleteAccount")]
        public IActionResult DeleteAccount([FromQuery] string mail, [FromQuery] string parola)
        {
            string query = "DELETE FROM dbo.Clienti WHERE Mail = @Mail AND Parola = @Parola";
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                try
                {
                    myCon.Open();
                    using (SqlCommand myCommand = new SqlCommand(query, myCon))
                    {
                        myCommand.Parameters.AddWithValue("@Mail", mail);
                        myCommand.Parameters.AddWithValue("@Parola", parola);

                        int rowsAffected = myCommand.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Ok(new { message = "Account deleted successfully." });
                        }
                        else
                        {
                            return NotFound(new { message = "Account not found or incorrect password." });
                        }
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = $"Error: {ex.Message}" });
                }
            }
        }

        [HttpGet]
        [Route("GetContractsWithFilters")]
        public JsonResult GetContractsWithFilters(
    [FromQuery] string? email,
    [FromQuery] string? sex = null,
    [FromQuery] string? oras = null,
    [FromQuery] DateTime? dataSemnarii = null,
    [FromQuery] decimal? minSum = null,
    [FromQuery] decimal? maxSum = null)
        {
            string query = @"
        SELECT 
            c.IDContract,
            c.DataSemnarii,
            c.Suma,
            f.Nume as NumeFotomodel,
            f.Prenume as PrenumeFotomodel,
            f.Sex,
            f.Oras,
            cl.Nume as NumeClient
        FROM dbo.Contracte c
        JOIN dbo.Fotomodele f ON c.IDFotomodel = f.IDFotomodel
        JOIN dbo.Clienti cl ON c.IDClient = cl.IDClient
        WHERE cl.Mail = @Email";

            List<SqlParameter> parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@Email", email));

            if (!string.IsNullOrEmpty(sex))
            {
                query += " AND f.Sex = @Sex";
                parameters.Add(new SqlParameter("@Sex", sex));
            }

            if (!string.IsNullOrEmpty(oras))
            {
                query += " AND f.Oras = @Oras";
                parameters.Add(new SqlParameter("@Oras", oras));
            }

            if (dataSemnarii.HasValue)
            {
                query += " AND CONVERT(date, c.DataSemnarii) = @DataSemnarii";
                parameters.Add(new SqlParameter("@DataSemnarii", dataSemnarii.Value.Date));
            }

            if (minSum.HasValue)
            {
                query += " AND c.Suma >= @MinSum";
                parameters.Add(new SqlParameter("@MinSum", minSum.Value));
            }

            if (maxSum.HasValue)
            {
                query += " AND c.Suma <= @MaxSum";
                parameters.Add(new SqlParameter("@MaxSum", maxSum.Value));
            }

            query += " ORDER BY c.DataSemnarii DESC";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddRange(parameters.ToArray());
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }
            string citiesQuery = @"
        SELECT DISTINCT f.Oras
        FROM dbo.Contracte c
        JOIN dbo.Fotomodele f ON c.IDFotomodel = f.IDFotomodel
        JOIN dbo.Clienti cl ON c.IDClient = cl.IDClient
        WHERE cl.Mail = @Email";

            List<string> cities = new List<string>();
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand cityCommand = new SqlCommand(citiesQuery, myCon))
                {
                    cityCommand.Parameters.AddWithValue("@Email", email);
                    using (SqlDataReader cityReader = cityCommand.ExecuteReader())
                    {
                        while (cityReader.Read())
                        {
                            cities.Add(cityReader["Oras"].ToString());
                        }
                    }
                }
            }

            return new JsonResult(new { contracts = table, cities = cities });
        }
        [HttpGet]
        [Route("GetModelsByFeedback")]
        public JsonResult GetModelsByFeedback([FromQuery] string sortOrder = "desc")
        {
            string query = @"
        SELECT 
            f.IDFotomodel,
            f.Nume,
            f.Prenume,
            f.Oras,
            f.Telefon,
            f.Mail,
            AVG(CAST(fb.Rating AS FLOAT)) as AverageRating
        FROM dbo.Fotomodele f
        LEFT JOIN dbo.Feedback fb ON f.IDFotomodel = fb.IDFotomodel
        GROUP BY 
            f.IDFotomodel,
            f.Nume,
            f.Prenume,
            f.Oras,
            f.Telefon,
            f.Mail
        ORDER BY 
            AverageRating " + (sortOrder.ToLower() == "asc" ? "ASC" : "DESC");

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }

        [HttpGet]
        [Route("GetModelEvents")]
        public JsonResult GetModelEvents(string nume, string prenume)
        {
            string query = @"
        SELECT 
            e.Nume AS NumeEveniment,
            e.Data,
            fe.OreParticipare,
            fe.Rol
        FROM dbo.Evenimente e
        INNER JOIN dbo.FotomodelEveniment fe ON e.IDEveniment = fe.IDEveniment
        INNER JOIN dbo.Fotomodele f ON fe.IDFotomodel = f.IDFotomodel
        WHERE f.Nume = @Nume AND f.Prenume = @Prenume
        ORDER BY e.Data DESC";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Nume", nume);
                    myCommand.Parameters.AddWithValue("@Prenume", prenume);
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }
        [HttpGet]
        [Route("GetModelReviews")]
        public JsonResult GetModelReviews(string nume, string prenume)
        {
            string query = @"
        SELECT c.Nume AS ClientNume, f.Rating, f.Comentarii, f.Data
        FROM dbo.Feedback f
        INNER JOIN dbo.Clienti c ON f.IDClient = c.IDClient
        INNER JOIN dbo.Fotomodele fm ON f.IDFotomodel = fm.IDFotomodel
        WHERE fm.Nume = @Nume AND fm.Prenume = @Prenume
        ORDER BY f.Data DESC";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Nume", nume);
                    myCommand.Parameters.AddWithValue("@Prenume", prenume);
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }


        [HttpGet]
        [Route("GetClientFeedbackHistory")]
        public JsonResult GetClientFeedbackHistory(string email)
        {
            string query = @"
        SELECT 
            f.Nume AS ModelNume,
            f.Prenume AS ModelPrenume,
            fb.Rating,
            fb.Comentarii,
            fb.Data
        FROM dbo.Feedback fb
        INNER JOIN dbo.Clienti c ON fb.IDClient = c.IDClient
        INNER JOIN dbo.Fotomodele f ON fb.IDFotomodel = f.IDFotomodel
        WHERE c.Mail = @Email
        ORDER BY fb.Data DESC";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Email", email);
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }

        [HttpPost]
        [Route("CreateContract")]
        public JsonResult CreateContract([FromBody] ContractModel contract)
        {
            string query = @"
        BEGIN TRANSACTION;
        BEGIN TRY
            DECLARE @IDClient int
            DECLARE @IDFotomodel int
            DECLARE @IDLocatie int

            SELECT @IDClient = IDClient FROM dbo.Clienti WHERE Mail = @Email;
            SELECT @IDFotomodel = IDFotomodel FROM dbo.Fotomodele 
            WHERE Nume = @ModelNume AND Prenume = @ModelPrenume;

            IF NOT EXISTS (SELECT 1 FROM dbo.Locatii WHERE Oras = @Oras)
BEGIN
    INSERT INTO dbo.Locatii (Oras, Capacitate, Strada) 
    VALUES (@Oras, 0, 'Strada Principala'); 
END



            SELECT @IDLocatie = IDLocatie FROM dbo.Locatii WHERE Oras = @Oras;

            IF NOT EXISTS (
    SELECT 1 FROM dbo.LocatieClient 
    WHERE IDClient = @IDClient AND IDLocatie = @IDLocatie
)
BEGIN
    INSERT INTO dbo.LocatieClient (IDClient, IDLocatie, DataRezervarii) 
    VALUES (@IDClient, @IDLocatie, GETDATE());  -- sau @DataSemnarii
END


            INSERT INTO dbo.Contracte (IDClient, IDFotomodel, DataSemnarii, Suma)
            VALUES (@IDClient, @IDFotomodel, @DataSemnarii, @Suma);

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH";

            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Email", contract.Email);
                    myCommand.Parameters.AddWithValue("@ModelNume", contract.ModelNume);
                    myCommand.Parameters.AddWithValue("@ModelPrenume", contract.ModelPrenume);
                    myCommand.Parameters.AddWithValue("@DataSemnarii", contract.DataSemnarii);
                    myCommand.Parameters.AddWithValue("@Suma", contract.Suma);
                    myCommand.Parameters.AddWithValue("@Oras", contract.Oras);

                    try
                    {
                        var result = myCommand.ExecuteNonQuery();
                        return new JsonResult($"Contract added successfully. Rows affected: {result}");
                    }
                    catch (SqlException ex)
                    {
                        return new JsonResult($"SQL Error: {ex.Message}, Error Code: {ex.Number}");
                    }
                    catch (Exception ex)
                    {
                        return new JsonResult($"Error adding contract: {ex.Message}, Stack: {ex.StackTrace}");
                    }
                }
            }
        }
        [HttpDelete]
        [Route("DeleteContract")]
        public JsonResult DeleteContract(int contractId)
        {
            string query = @"
        BEGIN TRANSACTION;
        BEGIN TRY
            DELETE FROM dbo.Contracte 
            WHERE IDContract = @ContractId;
            
            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH";

            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@ContractId", contractId);

                    try
                    {
                        myCommand.ExecuteNonQuery();
                        return new JsonResult("Contract deleted successfully");
                    }
                    catch (Exception ex)
                    {
                        return new JsonResult($"Error deleting contract: {ex.Message}");
                    }
                }
            }
        }
        [HttpGet]
        [Route("GetAboveAverageModels")]
        public JsonResult GetAboveAverageModels()
        {
            string query = @"
        SELECT f.Nume, f.Prenume, f.Sex, f.Oras,
            (SELECT COUNT(*) 
             FROM FotomodelEveniment fe 
             WHERE fe.IDFotomodel = f.IDFotomodel) as EventCount
        FROM Fotomodele f
        WHERE (
            SELECT COUNT(*) 
            FROM FotomodelEveniment fe 
            WHERE fe.IDFotomodel = f.IDFotomodel
        ) > (
            SELECT AVG(event_count) 
            FROM (
                SELECT COUNT(*) as event_count 
                FROM FotomodelEveniment 
                GROUP BY IDFotomodel
            ) as avg_events
        )
        ORDER BY EventCount DESC";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }
        [HttpGet]
        [Route("GetModelsByEarnings")]
        public JsonResult GetModelsByEarnings(string sortOrder = "desc")
        {
            string query = @"
        SELECT f.Nume, f.Prenume, f.Sex, f.Oras,
            (SELECT SUM(c.Suma) 
             FROM Contracte c 
             WHERE c.IDFotomodel = f.IDFotomodel) as TotalEarnings
        FROM Fotomodele f
        WHERE EXISTS (
            SELECT 1 FROM Contracte c 
            WHERE c.IDFotomodel = f.IDFotomodel
        )
        ORDER BY TotalEarnings " + (sortOrder == "asc" ? "ASC" : "DESC");

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }
        [HttpGet]
        [Route("GetModelsInMultipleCities")]
        public JsonResult GetModelsInMultipleCities()
        {
            string query = @"
        SELECT DISTINCT f.Nume, f.Prenume, f.Sex, f.Oras,
            (SELECT COUNT(DISTINCT l.Oras) 
             FROM Contracte c
             JOIN LocatieClient lc ON c.IDClient = lc.IDClient
             JOIN Locatii l ON lc.IDLocatie = l.IDLocatie
             WHERE c.IDFotomodel = f.IDFotomodel) as CityCount,
            STUFF((
                SELECT ', ' + l2.Oras
                FROM Contracte c2
                JOIN LocatieClient lc2 ON c2.IDClient = lc2.IDClient
                JOIN Locatii l2 ON lc2.IDLocatie = l2.IDLocatie
                WHERE c2.IDFotomodel = f.IDFotomodel
                FOR XML PATH('')), 1, 2, '') as Cities
        FROM Fotomodele f
        WHERE (
            SELECT COUNT(DISTINCT l.Oras)
            FROM Contracte c
            JOIN LocatieClient lc ON c.IDClient = lc.IDClient
            JOIN Locatii l ON lc.IDLocatie = l.IDLocatie
            WHERE c.IDFotomodel = f.IDFotomodel
        ) > 1
        ORDER BY CityCount DESC, f.Nume, f.Prenume";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }
        [HttpGet]
        [Route("GetSimilarModels")]
        public JsonResult GetSimilarModels(string nume, string prenume)
        {
            string query = @"
        WITH CurrentModelStats AS (
            SELECT 
                AVG(f.Rating) as AvgRating,
                COUNT(DISTINCT fe.IDEveniment) as EventCount
            FROM Fotomodele fm
            LEFT JOIN Feedback f ON fm.IDFotomodel = f.IDFotomodel
            LEFT JOIN FotomodelEveniment fe ON fm.IDFotomodel = fe.IDFotomodel
            WHERE fm.Nume = @Nume AND fm.Prenume = @Prenume
        )
        SELECT DISTINCT 
            fm.Nume, 
            fm.Prenume,
            fm.Sex,
            fm.Oras,
            (SELECT AVG(Rating) FROM Feedback WHERE IDFotomodel = fm.IDFotomodel) as AvgRating,
            (SELECT COUNT(*) FROM FotomodelEveniment WHERE IDFotomodel = fm.IDFotomodel) as EventCount
        FROM Fotomodele fm
        WHERE (fm.Nume != @Nume OR fm.Prenume != @Prenume)
        AND EXISTS (
            SELECT 1
            FROM CurrentModelStats cms
            WHERE ABS((SELECT AVG(Rating) FROM Feedback WHERE IDFotomodel = fm.IDFotomodel) - cms.AvgRating) <= 1
            AND ABS((SELECT COUNT(*) FROM FotomodelEveniment WHERE IDFotomodel = fm.IDFotomodel) - cms.EventCount) <= 1
        )
        ORDER BY AvgRating DESC";

            DataTable table = new DataTable();
            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");

            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Nume", nume);
                    myCommand.Parameters.AddWithValue("@Prenume", prenume);
                    using (SqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        table.Load(myReader);
                    }
                }
            }

            return new JsonResult(table);
        }


        [HttpPut]
        [Route("ModifyUsername")]
        public JsonResult ModifyUsername([FromBody] ModifyUsernameModel model)
        {
            string query = @"
        UPDATE dbo.Clienti 
        SET Nume = @NewUsername
        WHERE Mail = @Email AND Parola = @CurrentPassword";

            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Email", model.Email);
                    myCommand.Parameters.AddWithValue("@CurrentPassword", model.CurrentPassword);
                    myCommand.Parameters.AddWithValue("@NewUsername", model.NewUsername);

                    try
                    {
                        int rowsAffected = myCommand.ExecuteNonQuery();
                        if (rowsAffected > 0)
                            return new JsonResult("Username modified successfully");
                        return new JsonResult("Invalid credentials");
                    }
                    catch (Exception ex)
                    {
                        return new JsonResult($"Error modifying username: {ex.Message}");
                    }
                }
            }
        }

        [HttpPut]
        [Route("ModifyPassword")]
        public JsonResult ModifyPassword([FromBody] ModifyPasswordModel model)
        {
            string query = @"
        UPDATE dbo.Clienti 
        SET Parola = @NewPassword
        WHERE Mail = @Email AND Parola = @CurrentPassword";

            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@Email", model.Email);
                    myCommand.Parameters.AddWithValue("@CurrentPassword", model.CurrentPassword);
                    myCommand.Parameters.AddWithValue("@NewPassword", model.NewPassword);

                    try
                    {
                        int rowsAffected = myCommand.ExecuteNonQuery();
                        if (rowsAffected > 0)
                            return new JsonResult("Password modified successfully");
                        return new JsonResult("Invalid credentials");
                    }
                    catch (Exception ex)
                    {
                        return new JsonResult($"Error modifying password: {ex.Message}");
                    }
                }
            }
        }

        [HttpPut]
        [Route("ModifyContractSum")]
        public JsonResult ModifyContractSum(int contractId, decimal newSum)
        {
            string query = @"
        UPDATE dbo.Contracte 
        SET Suma = @NewSum
        WHERE IDContract = @ContractId";

            string sqlDatasource = _configuration.GetConnectionString("AgentieAppDBCon");
            using (SqlConnection myCon = new SqlConnection(sqlDatasource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@ContractId", contractId);
                    myCommand.Parameters.AddWithValue("@NewSum", newSum);

                    try
                    {
                        int rowsAffected = myCommand.ExecuteNonQuery();
                        if (rowsAffected > 0)
                            return new JsonResult("Contract sum modified successfully");
                        return new JsonResult("Contract not found");
                    }
                    catch (Exception ex)
                    {
                        return new JsonResult($"Error modifying contract sum: {ex.Message}");
                    }
                }
            }
        }




    }

    public class ContractModel
        {
            public string Email { get; set; }
            public string ModelNume { get; set; }
            public string ModelPrenume { get; set; }
            public DateTime DataSemnarii { get; set; }
            public decimal Suma { get; set; }
            public string Oras { get; set; }
        }


        public class UserCredentials
    {
        public string Nume { get; set; }
        public string Telefon { get; set; }
        public string Mail { get; set; }
        public string Parola { get; set; }
    }
    public class ModifyUsernameModel
    {
        public string Email { get; set; }
        public string CurrentPassword { get; set; }
        public string NewUsername { get; set; }
    }

    public class ModifyPasswordModel
    {
        public string Email { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}


