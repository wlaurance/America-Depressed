CREATE TABLE "Customer"
(
  "SSN" character varying(10) NOT NULL, 
  "First_Name" character varying(50) NOT NULL, 
  "Last_Name" character varying(50) NOT NULL, 
  "Gender" character varying(6) NOT NULL, 
  "Zip" integer NOT NULL, 
  "Credit_Score" integer NOT NULL, 
  PRIMARY KEY ("SSN")
) 
WITH (
  OIDS = FALSE
)
;

