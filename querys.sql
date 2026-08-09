use [farmacia-guadalupe-database]

CREATE TABLE [dbo].[brands](
	[id_brand] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[name] [nvarchar](100) NOT NULL,
	[logo_url] [nvarchar](255) NULL,
	[contact_phone] [nvarchar](15) NULL,
	[contact_email] [nvarchar](100) NULL,
	[created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
	[updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
	[is_active] [bit] NOT NULL
);

CREATE TABLE Category (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(MAX),
    is_active BIT DEFAULT 1
); 

CREATE TABLE ActiveIngredient (
    active_ingredient_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    is_controlled BIT DEFAULT 0, -- 1 si requiere receta especial (psicotrópicos)
    is_active BIT DEFAULT 1
); 

CREATE TABLE AdministrationRoute (
    administration_route_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1 -- Usamos BIT en SQL Server para booleanos (1 = Activo)
);


CREATE TABLE Presentation (
    presentation_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,        -- Ej: Caja, Frasco, Blíster, Sobre
    description NVARCHAR(MAX),         -- Notas adicionales sobre el empaque
    is_active BIT DEFAULT 1            -- 1 para Activo, 0 para Inactivo
);


CREATE TABLE Presentation (
    presentation_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,        -- Ej: Caja, Frasco, Blíster, Sobre
    description NVARCHAR(MAX),         -- Notas adicionales sobre el empaque
    is_active BIT DEFAULT 1            -- 1 para Activo, 0 para Inactivo
);

CREATE TABLE UnitOfMeasure (
    unit_of_measure_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL,        -- Ej: Miligramos, Mililitros, Tabletas, Ampollas
    abbreviation NVARCHAR(10),         -- Ej: mg, ml, tab, amp
    is_active BIT DEFAULT 1
);

CREATE TABLE DoseUnit (
    dose_unit_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL, -- Miligramos, Gramos, Unidades Internacionales
    abbreviation NVARCHAR(10) NOT NULL
);

CREATE TABLE Manufacturer (
    manufacturer_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    phone NVARCHAR(20),
    email NVARCHAR(100),
    website NVARCHAR(255),
    is_active BIT DEFAULT 1
);

CREATE TABLE Product (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    supplier_id INT NOT NULL,
    presentation_id INT NOT NULL,          -- Ej: Caja
    unit_of_measure_id INT NOT NULL,       -- Ej: Tableta
    
    -- Lógica de Inventario
    units_per_presentation INT DEFAULT 1,  -- Cuántas pastillas trae la caja
    stock_units INT DEFAULT 0,             -- Stock total en unidades sueltas
    min_stock_units INT DEFAULT 10,        -- Alerta
    
    -- Lógica de Precios
    price_full_presentation DECIMAL(10,2), -- Precio de venta caja completa
    price_per_unit DECIMAL(10,2),          -- Precio de venta por unidad suelta
    is_fractionable BIT DEFAULT 0, 
    
    product_status_id INT DEFAULT 1,
    currency VARCHAR(20) DEFAULT 'NIO',
    created_at DATETIME DEFAULT GETDATE(),

    -- Restricciones
    CONSTRAINT FK_Product_Supplier FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
    CONSTRAINT FK_Product_Presentation FOREIGN KEY (presentation_id) REFERENCES Presentation(presentation_id),
    CONSTRAINT FK_Product_Unit FOREIGN KEY (unit_of_measure_id) REFERENCES UnitOfMeasure(unit_of_measure_id),
    CONSTRAINT FK_Product_Status FOREIGN KEY (product_status_id) REFERENCES ProductStatus(product_status_id)
);

CREATE TABLE Batch (
    batch_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL,           -- FK a Product
    batch_code VARCHAR(50) NOT NULL,    -- El código físico en la caja
    expiration_date DATE NOT NULL,      -- Fecha de vencimiento
    
    -- Lógica de Inventario por Lote
    initial_quantity_units INT NOT NULL, -- Cantidad con la que entró el lote (en unidades)
    current_quantity_units INT NOT NULL, -- Cantidad que queda (en unidades)
    
    is_active BIT DEFAULT 1,            -- Para bloquear lotes vencidos o dañados
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Batch_Product FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE Medicine (
    medicine_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL,           -- El puente al inventario
    id_brand INT NOT NULL,             -- Marca (ej: Genfar)
    manufacturer_id INT NOT NULL,      -- Laboratorio (ej: Bayer)
    category_id INT NOT NULL,          -- Categoría (ej: Antibiótico)
    administration_route_id INT NOT NULL, -- Vía (ej: Oral)
    
    name VARCHAR(150) NOT NULL,        -- Nombre comercial (ej: Apronax)
    description VARCHAR(MAX),
    requires_prescription BIT DEFAULT 0,
    
    -- Los campos de presentación y unidad de medida 
    -- se quedan en la tabla PRODUCT para manejar el stock.
    
    CONSTRAINT FK_Medicine_Product FOREIGN KEY (product_id) REFERENCES Product(product_id),
    CONSTRAINT FK_Medicine_Brand FOREIGN KEY (id_brand) REFERENCES brands(id_brand),
    CONSTRAINT FK_Medicine_Manufacturer FOREIGN KEY (manufacturer_id) REFERENCES Manufacturer(manufacturer_id),
    CONSTRAINT FK_Medicine_Category FOREIGN KEY (category_id) REFERENCES Category(category_id),
    CONSTRAINT FK_Medicine_Route FOREIGN KEY (administration_route_id) REFERENCES AdministrationRoute(administration_route_id)
);


CREATE TABLE MedicineActiveIngredient (
    medicine_id INT NOT NULL,
    active_ingredient_id INT NOT NULL,
    dose_value DECIMAL(10,2) NOT NULL,    -- Ej: 500.00
    dose_unit_id INT NOT NULL,            -- FK a DoseUnit (mg, ml, etc.)
    
    PRIMARY KEY (medicine_id, active_ingredient_id),
    CONSTRAINT FK_MedAI_Medicine FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id),
    CONSTRAINT FK_MedAI_Ingredient FOREIGN KEY (active_ingredient_id) REFERENCES ActiveIngredient(active_ingredient_id),
    CONSTRAINT FK_MedAI_DoseUnit FOREIGN KEY (dose_unit_id) REFERENCES DoseUnit(dose_unit_id)
);

select * from SupplierType;
select * from Supplier;
INSERT INTO Supplier (supplier_type_id, company_name, tax_id, contact_name, phone, address, email, website, is_active) VALUES 
(1, 'Pfizer S.A.', '20100012341', 'Javier Mondragón', '+51 987654321', 'Av. Javier Prado 123, Lima', 'ventas@pfizer.com', 'www.pfizer.com', 1),
(1, 'Bayer Pharma Perú', '20100055662', 'Elena Torres', '+51 912334455', 'Parque Industrial Sur, Nave 4', 'contacto.bayer@bayer.com', 'www.bayer.com', 1),
(1, 'Droguería Santa María', '20556677883', 'Roberto Gómez', '+51 900112233', 'Calle Los Jazmines 456', 'pedidos@santamaria.pe', 'www.santamaria.pe', 1),
(1, 'Laboratorios Bagó', '20889977664', 'Carlos Ruiz', '+51 977889900', 'Av. Central 789, San Isidro', 'ventas.bago@bago.com.pe', 'www.bago.com', 1),
(2, 'Global Medical Supplies', '20443322115', 'Martha Stewart', '+51 944556677', 'Zona Franca, Lote 12', 'info@globalmed.com', NULL, 1),
(2, 'Distribuidora Alfa', '20667788996', 'Lucía Méndez', '+51 922334455', 'Av. La Marina 1010', 'alfa.ventas@distalfa.com', 'www.distalfa.com', 1),
(2, 'Sanofi Aventis', '20334455667', 'Ricardo Palma', '+51 955667788', 'Calle Las Begonias 450', 'pedidos.sanofi@sanofi.com', 'www.sanofi.com', 1),
(2, 'Roche Farma', '20112233448', 'Sofía Loren', '+51 966778899', 'Av. Primavera 234', 'atencion.roche@roche.com', 'www.roche.com', 1),
(3, 'Insumos Médicos del Norte', '20778899009', 'Pedro Picapiedra', '+51 933445566', 'Jr. Huallaga 567, Trujillo', 'ventas@insumosnorte.com', NULL, 1),
(3, 'Albis S.A.', '20223344550', 'Mariana Paz', '+51 988776655', 'Av. Los Olivos 890', 'm.paz@albis.com.pe', 'www.albis.pe', 1),
(3, 'GlaxoSmithKline (GSK)', '20554433221', 'Andrés Calamaro', '+51 911223344', 'Av. El Derby 155', 'gsk.peru@gsk.com', 'www.gsk.com', 1),
(4, 'Laboratorios Portugal', '20445566772', 'Gabriela Mistral', '+51 999888777', 'Calle Melgar 123, Arequipa', 'ventas@labportugal.com', 'www.labportugal.com', 1),
(4, 'Mantenimiento BioMédico', '20998877663', 'Jorge Drexler', '+51 955443322', 'Pasaje Los Pinos 78', 'soporte@biomedico.pe', 'www.biomedico.pe', 1),
(4, 'Merck Sharp & Dohme', '20332211444', 'Jimena Barón', '+51 922110033', 'Av. República de Panamá 345', 'ventas.msd@merck.com', 'www.merck.com', 1),
(4, 'Droguería El Rápido', '20665544335', 'Felipe Massa', '+51 944332211', 'Av. Aviación 1500', 'logistica@elrapido.com', NULL, 0);

select * from Product;
INSERT INTO Product (
    barcode,
    supplier_id, 
    presentation_id, 
    unit_of_measure_id, 
    units_per_presentation, 
    stock_units, 
    min_stock_units, 
    cost_price,
    price_full_presentation, 
    price_per_unit, 
    is_fractionable, 
    product_status_id
)
VALUES 
    -- 1. Paracetamol 500mg (Caja de 100 tabletas, fraccionable)
    ('490568821666', 2, 2, 5, 100, 500, 100, 200, 250.00, 3.00, 1, 1),

    -- 2. Amoxicilina Jarabe (Frasco único, NO fraccionable)
    ('792808837305', 2, 3, 6, 1, 20, 5, 100, 120.00, 120.00, 0, 1),

    -- 3. Alcohol Gel 500ml (Botella, NO fraccionable)
    ('425452104797', 2, 4, 7, 1, 50, 10, 50.0, 85.00, 85.00, 0, 1),

    -- 4. Ibuprofeno 400mg (Blíster de 10 tabletas dentro de caja, fraccionable)
    ('330211681193', 3, 2, 5, 10, 200, 30, 30.9, 45.00, 5.00, 1, 1),

    -- 5. Mascarillas Quirúrgicas (Caja de 50 unidades, fraccionable)
    ('172911711947', 2, 2, 8, 50, 500, 100, 90,150.00, 4.00, 1, 1);

select * from Product;
select * from Batch; 
select * from Medicine;
select * from Customer;
select * from Sale; 
select * from SaleDetail;
select * from SalePayment;
select * from InventoryTransaction;
select * from PaymentMethod

insert into PaymentMethod (name, is_active)
values ('efectivo', 1)

insert into Customer (identification_type, identification_number, first_name, last_name, address, phone, email, created_at)
values ('CEDULA', '001-010101-0001A', 'Cliente', 'Generico', '', '', '', GETDATE())

INSERT INTO Medicine (
    product_id, 
    id_brand, 
    manufacturer_id, 
    category_id, 
    administration_route_id, 
    name, 
    description, 
    requires_prescription
)
VALUES 
    -- 1. Un Analgésico popular
    (2, 1, 5, 1, 1, 'Panadol Niños', 'Paracetamol para alivio de fiebre y dolor', 0),

    -- 2. Un Antibiótico (Requiere receta)
    (3, 1, 8, 2, 1, 'Amoxicilina MK', 'Antibiótico de amplio espectro', 1),

    -- 3. Una Crema Dermatológica
    (4, 1, 3, 5, 2, 'Clotrimazol Genfar', 'Antimicótico de uso tópico', 0),

    -- 4. Un Antinflamatorio fuerte
    (5, 2, 2, 1, 1, 'Apronax', 'Naproxeno sódico de 550mg', 0),

    -- 5. Una Suspensión Oral
    (6, 5, 1, 4, 1, 'Pepto-Bismol', 'Alivio de malestar estomacal y acidez', 0);


SELECT * FROM Medicine;
select * from ActiveIngredient;
select * from MedicineActiveIngredient;
select * from UnitOfMeasure;
INSERT INTO MedicineActiveIngredient (medicine_id, active_ingredient_id, dose_value, dose_unit_id)
VALUES 
    -- Panadol Niños (ID 6) -> Paracetamol (ID 1) 120mg (común en niños)
    (1, 1, 120.00, 1), 

    -- Amoxicilina MK (ID 7) -> Amoxicilina (ID 2) 500mg
    (2, 2, 500.00, 1),

    -- Clotrimazol Genfar (ID 8) -> Clotrimazol (ID 3) 1%
    (3, 3, 1.00, 4),

    -- Apronax (ID 9) -> Naproxeno Sódico (ID 4) 550mg
    (4, 4, 550.00, 1),

    -- Pepto-Bismol (ID 10) -> Subsalicilato de Bismuto (ID 5) 262mg
    (5, 5, 262.00, 1);


select * from Batch;
select * from Product; 
INSERT INTO Batch (
    product_id, 
    batch_code, 
    expiration_date, 
    initial_quantity_units, 
    current_quantity_units, 
    is_active
)
VALUES 
    -- Lotes para Panadol Niños (product_id 1) - Total 300 unidades
    (2, 'LOTE-PAN2026-01', '2026-12-01', 200, 200, 1),
    (2, 'LOTE-PAN2025-05', '2025-08-15', 100, 100, 1), -- Este vence antes

    -- Lote para Amoxicilina MK (product_id 2) - Total 20 unidades
    (3, 'AMX-MK-998', '2027-01-20', 20, 20, 1),

    -- Lote para Clotrimazol (product_id 3) - Total 50 unidades
    (4, 'CLO-GEN-44', '2026-06-30', 50, 50, 1),

    -- Lotes para Apronax (product_id 4) - Total 200 unidades
    (5, 'APR-B-202', '2026-11-15', 100, 100, 1),
    (5, 'APR-B-203', '2027-03-10', 100, 100, 1),

    -- Lote para Pepto-Bismol (product_id 5) - Total 500 unidades
    (6, 'PEPTO-XYZ', '2028-01-01', 500, 500, 1);